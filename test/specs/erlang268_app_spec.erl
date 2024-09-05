-module(erlang268_app_spec).
-compile([export_all, nowarn_export_all]).
-include_lib("ebdd/include/ebdd.hrl").

spec() -> [
    describe, "erlang268_app", [
        "should load module erlang268_app successfully", fun() ->
            ?assertEqual({module,erlang268_app}, code:ensure_loaded(erlang268_app))
        end,

        describe, "test export functions", [
            "should export function start/2 in module", fun() ->
                M = erlang268_app:module_info(),
                ListExportFuns = proplists:get_value(exports, M),
                ?assertEqual(true, proplists:is_defined(start, ListExportFuns)),
                ?assert(lists:member(2, proplists:get_all_values(start, ListExportFuns)))
            end,

            "should export function stop/1 in module", fun() ->
                M = erlang268_app:module_info(),
                ListExportFuns = proplists:get_value(exports, M),
                ?assertEqual(true, proplists:is_defined(stop, ListExportFuns)),
                ?assert(lists:member(1, proplists:get_all_values(stop, ListExportFuns)))
            end
        ]
    ]
].
