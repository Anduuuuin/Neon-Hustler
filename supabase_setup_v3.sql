-- Neon Hustler · Schritt 3: eigene Base (Unterschlupf) + Kopfgeld
-- Nur ERGÄNZUNG – löscht nichts. Im Supabase SQL-Editor komplett ausführen.

alter table public.nh_players add column if not exists base jsonb;

-- Eigene Base speichern (max. ~20 KB)
create or replace function public.nh_save_base(p_code text, p_secret text, p_base jsonb) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  if octet_length(p_base::text) > 20000 then raise exception 'too big'; end if;
  update nh_players set base = p_base where code = p_code;
  return true;
end $$;

-- Base eines anderen Spielers laden (für den Überfall)
create or replace function public.nh_get_base(p_victim text) returns jsonb
language sql security definer set search_path = public, extensions as $$
  select base from nh_players where code = p_victim;
$$;

-- Überfall beenden – mit Kopfgeld für den Verteidiger, wenn der Angreifer scheitert
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
    update nh_players set vault = vault - loot, raid_shield = now() + interval '8 hours' where code = p_victim;
  else
    loot := greatest(0, least(coalesce(p_bounty, 0), 20000));
    update nh_players set raid_shield = now() + interval '2 hours' where code = p_victim;
  end if;
  insert into nh_raids(attacker, victim, amount, success) values (p_code, p_victim, loot, p_success);
  return loot;
end $$;

grant execute on function public.nh_save_base(text,text,jsonb), public.nh_get_base(text),
  public.nh_raid_finish2(text,text,text,boolean,bigint) to anon, authenticated;
