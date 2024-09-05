-module(web_topic_detail).

-compile([export_all, nowarn_export_all]).

-include_lib("nitrogen/include/wf.hrl").

main() ->
    #template{file = "src/templates/web/template.html"}.

title() ->
    "web_topic_detail".

body() ->
    #label{text = "web_topic_detail body."}.

event(_) -> ok.

