-module(account).

% -erlydb([
%     {table, account},
%     {columns, [
%         {id, integer, [primary_key]},
%         {name, string},
%         {role, string},
%         {created_at, timestamp},
%         {updated_at, timestamp}
%     ]},
%     {relationships, [
%         % {account, {created_by, account, id}}  % Define the relationship
%     ]}
% ]).
