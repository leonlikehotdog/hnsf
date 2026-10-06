-- 数学二（302）· 云端进度同步：新建独立表 + 两个 RPC（不暴露表给匿名角色）
create table if not exists public.math2_saves (
  code       text primary key,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.math2_saves enable row level security;
revoke all on table public.math2_saves from anon, authenticated;

create or replace function public.math2_push(p_code text, p_payload jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  t timestamptz;
begin
  if p_code is null or length(p_code) < 12 then
    raise exception 'sync code too short (min 12 chars)';
  end if;
  if p_payload is null then
    raise exception 'payload required';
  end if;
  insert into public.math2_saves (code, payload, updated_at)
  values (p_code, p_payload, now())
  on conflict (code) do update
    set payload = excluded.payload,
        updated_at = now()
  returning updated_at into t;
  return t;
end;
$$;

create or replace function public.math2_pull(p_code text)
returns table (payload jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select s.payload, s.updated_at
  from public.math2_saves s
  where s.code = p_code;
$$;

revoke all on function public.math2_push(text, jsonb) from public;
revoke all on function public.math2_pull(text) from public;
grant execute on function public.math2_push(text, jsonb) to anon, authenticated;
grant execute on function public.math2_pull(text) to anon, authenticated;
