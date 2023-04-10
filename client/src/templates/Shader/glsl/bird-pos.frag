

			uniform float clock;
			uniform float del_change;

			void main()	{
				vec2 textcoordi = gl_FragCoord.xy / resolution.xy;
				vec4 temp_position = texture2D( PositionTexture, textcoordi );
				vec3 position = temp_position.xyz;
				vec3 velocity = texture2D( VeloctiyTexture, textcoordi ).xyz;

				float wcoordinate = temp_position.w;

				wcoordinate = mod( ( wcoordinate + del_change*2.0 +
					length(velocity.xz) * del_change * 3. +
					max(velocity.y, 0.0) * del_change * 6. ), 50.0 );

				gl_FragColor = vec4( position + velocity * del_change * 15. , wcoordinate );}