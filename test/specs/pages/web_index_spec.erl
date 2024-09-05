-module(web_index_spec).
-compile([export_all, nowarn_export_all]).
-include_lib("ebdd/include/ebdd.hrl").

spec() -> [
    describe, "web_index", [
        "should load module web_index successfully", fun() ->
            ?assertEqual({module,web_index}, code:ensure_loaded(web_index))
        end,

        describe, "test export functions", [
            "should export function main/0 in module", fun() ->
                M = web_index:module_info(),
                ListExportFuns = proplists:get_value(exports, M),
                ?assertEqual(true, proplists:is_defined(main, ListExportFuns)),
                ?assert(lists:member(0, proplists:get_all_values(main, ListExportFuns)))
            end,

            "should export function title/0 in module", fun() ->
                M = web_index:module_info(),
                ListExportFuns = proplists:get_value(exports, M),
                ?assertEqual(true, proplists:is_defined(title, ListExportFuns)),
                ?assert(lists:member(0, proplists:get_all_values(title, ListExportFuns)))
            end,

            "should export function body/0 in module", fun() ->
                M = web_index:module_info(),
                ListExportFuns = proplists:get_value(exports, M),
                ?assertEqual(true, proplists:is_defined(body, ListExportFuns)),
                ?assert(lists:member(0, proplists:get_all_values(body, ListExportFuns)))
            end
        ],

        "should display the title is \"web_index\"", fun() ->
            ?assertEqual("web_index", web_index:title())
        end
    ]
].

