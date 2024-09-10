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
        { Id, Title, Description, _, _, AuthorName } = Topic,

        TopicId = integer_to_list(Id),
        TitleStr = binary_to_list(Title),
        DescriptionStr = binary_to_list(Description),
        AuthorStr = binary_to_list(AuthorName),

        #rounded_panel{id = "topic" ++ TopicId, radius = [10], class = "test_box", body = [
            #h2{text = TitleStr},
            #p{body = DescriptionStr},
            #h4{text = "Author: " ++ AuthorStr}]
        }
    end, Topics),

    TopicListElement.


render_message() ->
    Account = user_util:get_user(),
    case Account of
        undefined -> 
            [
                #label { text = "Please login to see topics" },
                #button{id = "btn_login", text = "Login", postback = login}
            ];

        _ -> 
            Name = account:name(Account),
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

