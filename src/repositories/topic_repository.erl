-module(topic_repository).
-compile([export_all, nowarn_export_all]).

get_topic(TopicId) ->
  case topic:find({ id, '=', TopicId }) of
    [] -> undefined;
    [Topic] -> Topic
  end.

get_topic() ->
  Topics = topic:find_with({ order_by, { created_at, desc } }),
  Topics.

create_topic(Title, Description, AuthorId) ->
  Topic = topic:new_with([{title, Title}, {description, Description}, {account_id, AuthorId}]),
  topic:save_returning(Topic).
