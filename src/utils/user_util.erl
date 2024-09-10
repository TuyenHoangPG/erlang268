-module(user_util).
-compile([export_all, nowarn_export_all]).

-include_lib("nitrogen/include/wf.hrl").

get_user() ->
  case wf:user() of
    undefined -> undefined;
    {_, Account} -> Account
  end.
