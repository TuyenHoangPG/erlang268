-module(topic_repository).
-compile([export_all, nowarn_export_all]).

get_topic(TopicId) ->
  case topic:find({ id, '=', TopicId }) of
    [] -> undefined;
    [Topic] -> Topic
  end.

get_topic() ->
  Query = "
    SELECT 
      t.id, t.title, t.description, t.account_id, t.created_at, a.name
    FROM topic t
    JOIN account a ON t.account_id = a.id
    WHERE t.is_deleted = false
    ORDER BY created_at DESC
  ",

  % Topics = topic:find_with({ order_by, { created_at, desc } }),
  Topics = erlydb_psql:q2(Query),
  Topics.

create_topic(Title, Description, AuthorId) ->
  Topic = topic:new_with([{title, Title}, {description, Description}, {account_id, AuthorId}]),
  topic:save_returning(Topic).
