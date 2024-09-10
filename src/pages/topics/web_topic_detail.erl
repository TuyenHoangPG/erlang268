-module(web_topic_detail).

-compile([export_all, nowarn_export_all]).

-include_lib("nitrogen/include/wf.hrl").

main() ->
    #template{file = "src/templates/web/template.html"}.

title() ->
    "Topic Detail".

body() ->
    TopicId = wf:get_path_info(),
    Topic = topic_repository:get_topic(TopicId),

    if Topic == undefined ->
        [
            #label { text = "Topic not found" }
        ];
    true ->
        Author = account_repository:get_account_by_id(topic:account_id(Topic)),
        AuthorName = if Author == undefined -> "Unknown"; true -> binary_to_list(account:name(Author)) end,
        [
            #rounded_panel{id = "topic" ++ TopicId, radius = [10], body = [
                #h1 { text = "Title: " ++ binary_to_list(topic:title(Topic)) },
                #p { body = "Description: " ++ binary_to_list(topic:description(Topic)) },
                #h4 { text = "Author: " ++ AuthorName }]
            }
        ]
    end.

event(_) -> ok.

