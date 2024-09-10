-module(web_topic_new).

-compile([export_all, nowarn_export_all]).

-include_lib("nitrogen/include/wf.hrl").

main() ->
    #template{file = "src/templates/web/template.html"}.

title() ->
    "Create New Topic".

body() ->
    Body = [
        #fieldset {
            legend = "Create new topic",
            body = [
                #panel {
                    id = "create_topic",
                    body = [
                        #label { text = "New Topic"},#br{},
                        #label { text = "Title"}, #textbox{id = "title", next = "description" }, #br{},
                        #label { text = "Description"}, #textarea{id = "description"}, #br{},
                        #button { id = "btn_submit", text = "Create", postback = submit_topic },
                        #button { id = "btn_cancel", text = "Cancel", postback = cancel }
                    ]
                }
            ]
        }
    ],

    Body.

event(submit_topic) ->
    [Title] = wf:q(title),
    [Description] = wf:q(description),
    Author = user_util:get_user(),
    AuthorId = element(3, Author),

    io:format("Title: ~p~n", [Title]),
    io:format("Description: ~p~n", [Description]),
    io:format("AuthorId: ~p~n", [AuthorId]),

    CreatedTopic = topic_repository:create_topic(Title, Description, AuthorId),

    io:format("Created topic: ~p~n", [CreatedTopic]),

    wf:redirect("/topic/list");
event(cancel) ->
    wf:redirect("/topic/list");
event(_) -> ok.

