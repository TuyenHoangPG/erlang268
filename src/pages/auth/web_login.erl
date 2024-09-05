-module(web_login).

-compile([export_all, nowarn_export_all]).

-include_lib("nitrogen/include/wf.hrl").

main() ->
    #template{file = "src/templates/web/template.html"}.

title() ->
    "Login".

body() ->
    Body = [
        #panel{
            body = [
                #label{text = "Account Name"},
                #textbox{id = "account_name"},
                #br{},
                #button{id = "login_button", text = "Login", postback = handle_login}
            ],
            class = "login_form"
        }
    ],

    wf:wire("login_button", "account_name", #validate{
        validators = [
            #is_required{text = "Required field!"},
            #min_length{length = 5, text = "Enter at least 5 characters"},
            #max_length{length = 10, text = "Enter at most 10 characters"},
            #is_format_of { pattern = "^[a-zA-Z]{1}[a-zA-Z0-9_]+$", text = "Must start with a letter and contain only letters, numbers, and underscores."},
            #custom {function = fun check_exist/2, text = "This account name does not exist!", tag = "account_name"}
        ]
    }),

    Body.

check_exist(Tag, Value) ->
    io:format("Value: ~p", [Value]),

    % TODO: Add logic check if account name exists
    false.

% Event handler
event(handle_login) ->
    [AccountName] = wf:q("account_name"),
    io:format("Account Name: ~p~n", [AccountName]);
event(_) -> ok.

