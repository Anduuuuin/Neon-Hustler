-- Neon Hustler – Online ohne Anmeldung: Spieler-Code + geheimer Schlüssel pro Gerät
-- Ersetzt die vorherigen nh_-Tabellen. Bullseye Boss bleibt unberührt.

drop function if exists public.nh_add_faction_points(int);
drop function if exists public.nh_raid_finish(uuid, boolean);
drop function if exists public.nh_raid_targets();
drop table if exists public.nh_raids, public.nh_faction_week, public.nh_saves, public.nh_profiles cascade;

create extension if not exists pgcrypto;

-- Spieler (öffentlich lesbar über die Funktionen unten, Tabelle selbst ist gesperrt)
create table public.nh_players (
  code        text primary key,                 -- Freundes-Code, z. B. NH-4K7P2Q
  secret_hash text not null,                    -- nur der Hash des Geräte-Schlüssels
  name        text not null check (char_length(name) between 3 and 16),
  faction     text check (faction in ('kartell','neon','syndikat')),
  lvl         int not null default 1,
  prestige    int not null default 0,
  loot_total  bigint not null default 0,
  heists      int not null default 0,
  vault       bigint not null default 0,
  raid_shield timestamptz,
  save        jsonb,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create table public.nh_friends (
  code   text references public.nh_players(code) on delete cascade,
  friend text references public.nh_players(code) on delete cascade,
  primary key (code, friend)
);
create table public.nh_faction_week (
  week text not null, faction text not null check (faction in ('kartell','neon','syndikat')),
  points bigint not null default 0, primary key (week, faction)
);
create table public.nh_raids (
  id bigint generated always as identity primary key,
  attacker text references public.nh_players(code) on delete cascade,
  victim   text references public.nh_players(code) on delete cascade,
  amount bigint not null, success boolean not null, seen boolean not null default false,
  created_at timestamptz not null default now()
);
-- Tabellen komplett sperren: Zugriff NUR über die Funktionen
alter table public.nh_players enable row level security;
alter table public.nh_friends enable row level security;
alter table public.nh_faction_week enable row level security;
alter table public.nh_raids enable row level security;

-- Hilfsfunktion: prüft Code + Schlüssel
create or replace function public.nh_auth(p_code text, p_secret text) returns boolean
language sql security definer set search_path = public, extensions as $$
  select exists(select 1 from nh_players where code = p_code and secret_hash = crypt(p_secret, secret_hash));
$$;

-- Registrieren: gibt Code zurück (Schlüssel erzeugt das Spiel selbst)
create or replace function public.nh_register(p_name text, p_secret text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare c text; chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if char_length(p_secret) < 20 then raise exception 'secret'; end if;
  loop
    c := 'NH-';
    for i in 1..6 loop c := c || substr(chars, 1 + floor(random()*length(chars))::int, 1); end loop;
    exit when not exists(select 1 from nh_players where code = c);
  end loop;
  insert into nh_players(code, secret_hash, name) values (c, crypt(p_secret, gen_salt('bf')), trim(p_name));
  return c;
end $$;

-- Werte + Spielstand hochladen
create or replace function public.nh_sync(p_code text, p_secret text, p_name text, p_faction text, p_lvl int, p_prestige int,
  p_loot bigint, p_heists int, p_vault bigint, p_save jsonb) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  update nh_players set name = coalesce(nullif(trim(p_name),''), name), faction = p_faction,
    lvl = least(greatest(p_lvl,1),200), prestige = least(greatest(p_prestige,0),50),
    loot_total = greatest(p_loot,0), heists = greatest(p_heists,0), vault = greatest(p_vault,0),
    save = p_save, updated_at = now()
  where code = p_code;
end $$;

-- Spielstand auf anderem Gerät laden (Code + Schlüssel nötig)
create or replace function public.nh_load(p_code text, p_secret text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  return (select save from nh_players where code = p_code);
end $$;

-- Rangliste (öffentlich)
create or replace function public.nh_leaderboard(p_by text default 'lvl') returns table(code text, name text, faction text, lvl int, prestige int, loot_total bigint, heists int)
language sql security definer set search_path = public as $$
  select code, name, faction, lvl, prestige, loot_total, heists from nh_players
  order by case when p_by = 'loot' then loot_total else prestige*1000 + lvl end desc limit 50;
$$;

-- Freunde
create or replace function public.nh_add_friend(p_code text, p_secret text, p_friend text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare n text;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  select name into n from nh_players where code = upper(trim(p_friend));
  if n is null or upper(trim(p_friend)) = p_code then raise exception 'unknown'; end if;
  insert into nh_friends values (p_code, upper(trim(p_friend))) on conflict do nothing;
  insert into nh_friends values (upper(trim(p_friend)), p_code) on conflict do nothing;
  return n;
end $$;
create or replace function public.nh_friend_list(p_code text, p_secret text) returns table(code text, name text, faction text, lvl int, vault bigint, shielded boolean)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  return query select p.code, p.name, p.faction, p.lvl, p.vault, coalesce(p.raid_shield > now(), false)
    from nh_friends f join nh_players p on p.code = f.friend where f.code = p_code order by p.lvl desc;
end $$;

-- Fraktionskrieg
create or replace function public.nh_add_faction_points(p_code text, p_secret text, p_points int) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare f text; w text := to_char(now() at time zone 'utc', 'IYYY-"W"IW');
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  select faction into f from nh_players where code = p_code;
  if f is null then return; end if;
  insert into nh_faction_week(week, faction, points) values (w, f, least(greatest(p_points,0), 500))
  on conflict (week, faction) do update set points = nh_faction_week.points + excluded.points;
end $$;
create or replace function public.nh_faction_standings() returns table(faction text, points bigint)
language sql security definer set search_path = public as $$
  select faction, points from nh_faction_week where week = to_char(now() at time zone 'utc', 'IYYY-"W"IW') order by points desc;
$$;

-- Überfälle auf Freunde: max. 15 % vom Tresor, danach 8 h Schutz
create or replace function public.nh_raid_finish(p_code text, p_secret text, p_victim text, p_success boolean) returns bigint
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
    update nh_players set raid_shield = now() + interval '2 hours' where code = p_victim;
  end if;
  insert into nh_raids(attacker, victim, amount, success) values (p_code, p_victim, loot, p_success);
  return loot;
end $$;
create or replace function public.nh_my_raids(p_code text, p_secret text) returns table(id bigint, attacker_name text, amount bigint, success boolean, created_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  return query select r.id, p.name, r.amount, r.success, r.created_at from nh_raids r join nh_players p on p.code = r.attacker
    where r.victim = p_code and not r.seen order by r.created_at desc;
  update nh_raids set seen = true where victim = p_code and not seen;
end $$;

-- Funktionen für die öffentliche Spiel-Seite freigeben
grant execute on function public.nh_register(text,text), public.nh_sync(text,text,text,text,int,int,bigint,int,bigint,jsonb),
  public.nh_load(text,text), public.nh_leaderboard(text), public.nh_add_friend(text,text,text), public.nh_friend_list(text,text),
  public.nh_add_faction_points(text,text,int), public.nh_faction_standings(), public.nh_raid_finish(text,text,text,boolean),
  public.nh_my_raids(text,text) to anon, authenticated;
revoke execute on function public.nh_auth(text,text) from anon, authenticated, public;
