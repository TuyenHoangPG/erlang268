-module(account_repository).
-compile([export_all, nowarn_export_all]).

get_account(AccountName) ->
  io:format("get_account :: Account Name: ~p~n", [AccountName]),
  case account:find({ name, '=', AccountName }) of
    [] -> undefined;
    [Account] -> io:format("Account exist: ~p~n", [Account]), Account
  end.

get_account() ->
  Accounts = account:find(),
  io:format("Accounts: ~p~n", [Accounts]),
  Accounts.

get_role(Account) ->
  Role = element(7, Account),
  RoleStr = binary_to_list(Role),
  RoleStr.
