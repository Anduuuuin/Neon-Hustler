-- Neon Hustler · Schritt 4: Schutzzeit nach Tageszeit
-- Tagsüber (6–19 Uhr): 3 Stunden Schutz. Nachts: Schutz bis 6 Uhr morgens (mindestens 3 Stunden).
-- Gescheiterter Überfall: 1 Stunde Schutz.

create or replace function public.nh_shield_until() returns timestamptz
language plpgsql set search_path = public, extensions as $$
declare loc timestamp := now() at time zone 'Europe/Berlin'; h int := extract(hour from loc); d date;
begin
  if h >= 6 and h < 19 then return now() + interval '3 hours'; end if;
  d := case when h >= 19 then loc::date + 1 else loc::date end;
  return greatest((d + time '06:00') at time zone 'Europe/Berlin', now() + interval '3 hours');
end $$;

create or replace function public.nh_raid_finish2(p_code text, p_secret text, p_victim text, p_success boolean, p_bounty bigint) returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare v nh_players; loot bigint := 0;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  if p_victim = p_code then raise exception 'self'; end if;
  select * into v from nh_players where code = p_victim for update;
  if v is null then raise exception 'unknown'; end if;
  if v.raid_shield is not null and v.raid_shield > now() then raise exception 'shield'; end if;
  if p_success then
    loot := floor(v.vault * 0.15);
    update nh_players set vault = vault - loot, raid_shield = nh_shield_until() where code = p_victim;
  else
    loot := greatest(0, least(coalesce(p_bounty, 0), 20000));
    update nh_players set raid_shield = now() + interval '1 hour' where code = p_victim;
  end if;
  insert into nh_raids(attacker, victim, amount, success) values (p_code, p_victim, loot, p_success);
  return loot;
end $$;
