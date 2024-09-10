-module(topic).

% -erlydb([
%     {table, topic},
%     {columns, [
%         {id, integer, [primary_key]},
%         {title, string},
%         {description, string},
%         {account_id, integer},
%         {is_deleted, boolean},
%         {created_at, timestamp},
%         {updated_at, timestamp}
%     ]},
%     {relationships, [
%         {account, {account_id, account, id}}  % Define the relationship
%     ]}
% ]).