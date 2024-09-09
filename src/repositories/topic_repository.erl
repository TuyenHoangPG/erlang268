-module(topic_repository).
-compile([export_all, nowarn_export_all]).

get_topic(TopicId) ->
  case topics:find({ id, '=', TopicId }) of
    [] -> undefined;
    [Topic] -> Topic
  end.

get_topic() ->
  Topics = topics:find(),
  Topics.