-module(account_repository).
-compile([export_all, nowarn_export_all]).

get_account(AccountName) ->
  case account:find({ name, '=', AccountName }) of
    [] -> undefined;
    [Account] -> Account
  end.

get_account_by_id(AccountId) ->
  case account:find({ id, '=', AccountId }) of
    [] -> undefined;
    [Account] -> Account
  end.

get_account() ->
  Accounts = account:find(),
  io:format("Accounts: ~p~n", [Accounts]),
  Accounts.

get_role(Account) ->
  Role = account:role(Account),
  RoleStr = binary_to_list(Role),
  RoleStr.
