-module(web_topic_list).

-compile([export_all, nowarn_export_all]).

-include_lib("nitrogen/include/wf.hrl").

main() ->
    #template{file = "src/templates/web/template.html"}.

title() ->
    "List Topic".

body() ->
    MessageElement = render_message(),
    TopicElements = render_list_topic(),
    CreateTopicElement = render_create_topic(),

    Body = MessageElement ++ CreateTopicElement ++ TopicElements,
    Body.    

% Renderer
render_list_topic() ->
    Topics = topic_repository:get_topic(),
    TopicListElement = lists:map(fun(Topic) ->
        Id = integer_to_list(element(3, Topic)),
        Title = binary_to_list(element(4, Topic)),
        Description = binary_to_list(element(5, Topic)),
        Author = integer_to_list(element(6, Topic)),

        #rounded_panel{id = "topic" ++ Id, radius = [10], class = "test_box", body = [
            #h2{text = Title},
            #p{body = Description},
            #h4{text = "Author: " ++ Author}]
        }
    end, Topics),

    TopicListElement.


render_message() ->
    case wf:user() of
        undefined -> 
            [
                #label { text = "Please login to see topics comment" },
                #button{id = "btn_login", text = "Login", postback = login}
            ];

        {_, Account} -> 
            Name = element(4, Account),
            NameStr = binary_to_list(Name),
            [
                #label { text = "Welcome " ++ NameStr },
                #button{id = "btn_logout", text = "Logout", postback = logout}
            ]
    end.

render_create_topic() -> 
    [
        #panel{
            body = [
                #label{text = "Topic List"},
                #br{},
                #button{id = "btn_create_topic", text = "Create Topic", postback = create_topic}
            ],
            class = "topic_list"
        }
    ].

% Event handler
event(login) ->
    wf:redirect("/login");
event(logout) ->
    wf:logout(),
    wf:redirect("/topic/list");
event(create_topic) ->
    wf:redirect("/topic/new");
event(_) -> ok.

