-module(account_repository).
-compile([export_all, nowarn_export_all]).

get_account(AccountName) ->
  io:format("get_account :: Account Name: ~p~n", [AccountName]),
  case accounts:find({ name, '=', AccountName }) of
    [] -> undefined;
    [Account] -> io:format("Account exist: ~p~n", [Account]), Account
  end.

get_account() ->
  Accounts = accounts:find(),
  io:format("Accounts: ~p~n", [Accounts]),
  Accounts.
