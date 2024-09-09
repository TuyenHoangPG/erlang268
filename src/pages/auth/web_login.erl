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

check_exist(_Tag, Value) ->
    io:format("Value: ~p~n", [Value]),
    Account = account_repository:get_account(Value),

    case Account of
        undefined -> false;
        _ -> 
            Role = account_repository:get_role(Account),
            wf:role(role, Role),
            wf:user({account, Account}), true
    end.


% Event handler
event(handle_login) ->
    wf:redirect_from_login("/topic/list");
event(_) -> ok.

