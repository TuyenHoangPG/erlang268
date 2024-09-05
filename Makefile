compile:
	erl -noshell -noinput -eval "case make:all() of up_to_date -> erlang:halt(0); _ -> erlang:halt(1) end."

clean:
	rm -rf ebin/*.beam
	rm -rf lang/latest.dets
	rm -rf erl_crash.dump

test: compile
	ebdd spec test -pa ebin test/ebin

start: compile
	@echo Starting server...
	erl -smp +K true +P 1000000 \
		-sname erlang268 \
		-conf config/yaws.config \
		-setcookie secret_cookie \
		-pa ebin \
		-s make all \
                -eval "case application:start(erlang268) of \
                         {error, _} -> io:format(\"~nStart server failed.~n\" ++ \
                                                 \"If you need more information, try to start erlang shell with '-boot start_sasl' option.~n~n\"), \
                                       init:stop(1); \
                         _ -> io:format('Server start successfully~n') \
                      end"

msgmerge: clean compile
	erl -noshell -s gettext msgmerge -s init stop
