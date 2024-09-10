-module(erlang268_app).

-behavior(application).

-export([start/2, stop/1, route/1, before_filter/1, after_filter/2]).

start(_, _) ->
    Ret = fermium:start_link(erlang268),

    wf_filter:append_before_filter(
        login_filter,
        is_login_user,
        {url_pattern, "topic\/new$"}
    ),

    Ret.

stop(_) -> ok.

%% route/1 lets you define new URL routes to your web pages,
%% or completely create a new routing scheme.
%% The 'Path' argument specifies the request path. Your
%% function should return either an atom which is the page module
%% to run, or a tuple containing {Module, PathInfo}. PathInfo
%% can be accessed using wf:get_path_info().
%%
%% Uncomment the line below to direct requests
%% from "/newroute" to the web_index module:
%%
%% route("/newroute") -> web_index;
%%
%% Uncomment the line below to direct requests
%% from "/newroute" to the web_index module,
%% with trailing PathInfo included:
%%
route("/") -> {web_topic_list, []};
route(Path) -> nitrogen:route(Path).

%% If before_filter/1 exists, it will be executed before every Nitrogen page,
%% and lets you add authentication and authorization. The 'Module' argument
%% is the name of the page module.
%%
%% This function should return either 'ok' if processing can proceed,
%% or it can return a full-fledged page by treating it just like the main function
%% of a page. Alternatively, you can use the wf:redirect* functions to
%% issue a client-side redirect to a new page.
before_filter(_Module) -> ok.

% Code for testing basic authentication:
%
% before_filter(Module) ->
%     wf_http_basic_auth:run(Module, ?MODULE).
%
% realm() -> "Fermium".
%
% is_authenticated(Module, _) -> false.
%
% authenticate(Module, User, Password) ->
%     User == "user" andalso Password == "password".

%% If after_filter/2 exists, it will be executed after every Nitrogen page.
%% The 'Module' argument is the name of the page module.
%%
%% The result of this function is ignored.
after_filter(Response, _Module) -> 
    Response.

