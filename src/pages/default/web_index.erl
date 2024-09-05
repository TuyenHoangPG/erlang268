-module(web_index).

-compile([export_all, nowarn_export_all]).

-include_lib("nitrogen/include/wf.hrl").

main() ->
    #template{file = "src/templates/web/template.html"}.

title() ->
    "web_index".

body() ->
    #label{text = "web_index body."}.

event(_) -> ok.

