-module(topic_repository).
-compile([export_all, nowarn_export_all]).

get_topic(TopicId) ->
  case topics:find({ id, '=', TopicId }) of
    [] -> undefined;
    [Topic] -> Topic
  end.

get_topic() ->
  Topics = topics:find_with({ order_by, { created_at, desc } }),
  Topics.

create_topic(Title, Description, AuthorId) ->
  Topic = topics:new_with([{title, Title}, {description, Description}, {account_id, AuthorId}]),
  topics:save_returning(Topic).
