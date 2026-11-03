-- Neon Hustler · Schritt 5: Gangs + Rache
-- Nur ERGÄNZUNG. Im Supabase SQL-Editor komplett ausführen.

create table if not exists public.nh_gangs (
  id bigint generated always as identity primary key,
  tag text unique not null check (tag ~ '^[A-Z0-9]{3,5}$'),
  name text not null check (char_length(name) between 3 and 20),
  owner text references public.nh_players(code) on delete set null,
  vault bigint not null default 0,
  created_at timestamptz not null default now()
);
alter table public.nh_gangs enable row level security;
alter table public.nh_players add column if not exists gang bigint references public.nh_gangs(id) on delete set null;
alter table public.nh_players add column if not exists gang_joined timestamptz;
alter table public.nh_raids add column if not exists avenged boolean not null default false;

create or replace function public.nh_gang_create(p_code text, p_secret text, p_name text, p_tag text) returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare gid bigint;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  if (select gang from nh_players where code = p_code) is not null then raise exception 'already'; end if;
  insert into nh_gangs(tag, name, owner) values (upper(p_tag), p_name, p_code) returning id into gid;
  update nh_players set gang = gid, gang_joined = now() where code = p_code;
  return gid;
end $$;

create or replace function public.nh_gang_join(p_code text, p_secret text, p_tag text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare g nh_gangs;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  if (select gang from nh_players where code = p_code) is not null then raise exception 'already'; end if;
  select * into g from nh_gangs where tag = upper(p_tag);
  if g is null then raise exception 'unknown'; end if;
  if (select count(*) from nh_players where gang = g.id) >= 5 then raise exception 'full'; end if;
  update nh_players set gang = g.id, gang_joined = now() where code = p_code;
  return g.name;
end $$;

create or replace function public.nh_gang_leave(p_code text, p_secret text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare gid bigint; nxt text;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  select gang into gid from nh_players where code = p_code;
  if gid is null then return false; end if;
  update nh_players set gang = null, gang_joined = null where code = p_code;
  select code into nxt from nh_players where gang = gid order by gang_joined asc limit 1;
  if nxt is null then delete from nh_gangs where id = gid;
  else update nh_gangs set owner = nxt where id = gid and owner = p_code; end if;
  return true;
end $$;

create or replace function public.nh_gang_info(p_code text, p_secret text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare gid bigint; r jsonb;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  select gang into gid from nh_players where code = p_code;
  if gid is null then return null; end if;
  select jsonb_build_object('id', g.id, 'tag', g.tag, 'name', g.name, 'vault', g.vault, 'owner', g.owner,
    'members', (select jsonb_agg(jsonb_build_object('code', p.code, 'name', p.name, 'lvl', p.lvl, 'loot', p.loot_total) order by p.loot_total desc) from nh_players p where p.gang = g.id))
    into r from nh_gangs g where g.id = gid;
  return r;
end $$;

create or replace function public.nh_gang_donate(p_code text, p_secret text, p_amount bigint) returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare gid bigint; v bigint;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  if p_amount <= 0 or p_amount > 1000000 then raise exception 'amount'; end if;
  select gang into gid from nh_players where code = p_code;
  if gid is null then raise exception 'nogang'; end if;
  update nh_gangs set vault = vault + p_amount where id = gid returning vault into v;
  return v;
end $$;

create or replace function public.nh_gang_withdraw(p_code text, p_secret text, p_amount bigint) returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare g nh_gangs;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  select * into g from nh_gangs where id = (select gang from nh_players where code = p_code) for update;
  if g is null or g.owner <> p_code then raise exception 'notowner'; end if;
  if p_amount <= 0 or p_amount > g.vault then raise exception 'amount'; end if;
  update nh_gangs set vault = vault - p_amount where id = g.id;
  return p_amount;
end $$;

create or replace function public.nh_gang_ranking() returns table(tag text, name text, members bigint, score bigint)
language sql security definer set search_path = public, extensions as $$
  select g.tag, g.name, count(p.code), coalesce(sum(p.loot_total), 0) + g.vault
  from nh_gangs g left join nh_players p on p.gang = g.id
  group by g.id order by 4 desc limit 20;
$$;

-- Rache: wer hat mich in den letzten 24 h erfolgreich überfallen?
create or replace function public.nh_revenge_list(p_code text, p_secret text) returns table(code text, name text, lvl int, amount bigint, created_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  return query select distinct on (r.attacker) r.attacker, p.name, p.lvl, r.amount, r.created_at
    from nh_raids r join nh_players p on p.code = r.attacker
    where r.victim = p_code and r.success and not r.avenged and r.created_at > now() - interval '24 hours'
    order by r.attacker, r.created_at desc;
end $$;

-- Überfall beenden – jetzt mit Rache-Bonus (25 % statt 15 %, Schutz zählt nicht)
create or replace function public.nh_raid_finish2(p_code text, p_secret text, p_victim text, p_success boolean, p_bounty bigint) returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare v nh_players; loot bigint := 0; rev boolean;
begin
  if not nh_auth(p_code, p_secret) then raise exception 'auth'; end if;
  if p_victim = p_code then raise exception 'self'; end if;
  select * into v from nh_players where code = p_victim for update;
  if v is null then raise exception 'unknown'; end if;
  rev := exists(select 1 from nh_raids where attacker = p_victim and victim = p_code and success and not avenged and created_at > now() - interval '24 hours');
  if not rev and v.raid_shield is not null and v.raid_shield > now() then raise exception 'shield'; end if;
  if p_success then
    loot := floor(v.vault * (case when rev then 0.25 else 0.15 end));
    update nh_players set vault = vault - loot, raid_shield = nh_shield_until() where code = p_victim;
    if rev then update nh_raids set avenged = true where attacker = p_victim and victim = p_code and success; end if;
  else
    loot := greatest(0, least(coalesce(p_bounty, 0), 20000));
    update nh_players set raid_shield = now() + interval '1 hour' where code = p_victim;
  end if;
  insert into nh_raids(attacker, victim, amount, success) values (p_code, p_victim, loot, p_success);
  return loot;
end $$;

grant execute on function public.nh_gang_create(text,text,text,text), public.nh_gang_join(text,text,text), public.nh_gang_leave(text,text),
  public.nh_gang_info(text,text), public.nh_gang_donate(text,text,bigint), public.nh_gang_withdraw(text,text,bigint), public.nh_gang_ranking(),
  public.nh_revenge_list(text,text) to anon, authenticated;
