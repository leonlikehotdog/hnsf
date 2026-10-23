-- 好友联机：房间聊天室（历史消息）
-- 权限模型与 math2_saves 一致：表对 anon 零权限，只能通过 security definer 函数读写。

create table if not exists public.mp_chat (
  id bigserial primary key,
  room text not null,
  uid text not null,
  name text not null,
  kind text not null default 'text',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists mp_chat_room_idx on public.mp_chat (room, id desc);

alter table public.mp_chat enable row level security;
revoke all on public.mp_chat from anon, authenticated;

-- 发一条消息；顺带把每个房间的历史裁到最近 200 条
create or replace function public.mp_chat_push(
  p_code text, p_uid text, p_name text, p_kind text, p_body text
) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare ts timestamptz;
begin
  if length(coalesce(p_code, '')) < 8 then raise exception 'bad room code'; end if;
  if length(coalesce(p_body, '')) = 0 or length(p_body) > 200 then raise exception 'bad message'; end if;
  insert into mp_chat(room, uid, name, kind, body)
  values (upper(p_code), left(coalesce(p_uid, ''), 64), left(coalesce(p_name, ''), 24),
          left(coalesce(p_kind, 'text'), 12), p_body)
  returning created_at into ts;

  delete from mp_chat
  where room = upper(p_code)
    and id < (select id from mp_chat where room = upper(p_code) order by id desc offset 200 limit 1);

  return ts;
end $$;

-- 拉某房间最近的消息（按时间正序返回，便于直接追加）
create or replace function public.mp_chat_pull(p_code text, p_limit int default 50)
returns table (id bigint, uid text, name text, kind text, body text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select t.id, t.uid, t.name, t.kind, t.body, t.created_at
  from (
    select c.id, c.uid, c.name, c.kind, c.body, c.created_at
    from mp_chat c
    where c.room = upper(coalesce(p_code, ''))
    order by c.id desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200)
  ) t
  order by t.id asc;
$$;

revoke all on function public.mp_chat_push(text, text, text, text, text) from public;
revoke all on function public.mp_chat_pull(text, int) from public;
grant execute on function public.mp_chat_push(text, text, text, text, text) to anon;
grant execute on function public.mp_chat_pull(text, int) to anon;
