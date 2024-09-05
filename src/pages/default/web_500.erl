%%% The error is already logged. You may call erlang:get_stacktrace() to get more
%%% information if you want.
%%%
%%% On get_db_connection_timeout error, the error is not logged to because this
%%% error normally happens when the server is being overloaded. Logging error may
%%% make the problem worse.

-module(web_500).

-export([error/3]).

-include_lib("nitrogen/include/wf.hrl").

error(first_request, Type, Msg) ->
    wf:set_content_type("text/plain"),
    user_friendly_msg(Type, Msg);

error(postback, Type, Msg) ->
    wf:wire(#alert{text = user_friendly_msg(Type, Msg)}).

user_friendly_msg(Type, Msg) ->
    case {Type, Msg} of
        {throw, get_db_connection_timeout} ->
            "We're sorry, but the server is too busy right now. Please try again later.";
        _ ->
            "We're sorry, but something went wrong. We've been notified about this issue and we'll take a look at it shortly."
    end.
