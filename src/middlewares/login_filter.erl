-module(login_filter).
-export([is_login_user/1]).

is_login_user(_Module) -> 
  case wf:user() of
    undefined -> wf:redirect_to_login("/login");
    _ -> ok
  end.
