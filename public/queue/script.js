/*
 *
 *	Queue client
 *	By H
 *
 *	Expected events:
 *	queueresort 		(queue order changed)
 *	mus_progress		(song progress changed)
 *	skip(reqester)		(song has been skipped; show next one, but show who did it)
 *	newsong				(another song has been added; ignore if more than 20 are on screen, but make it show 'load more' button )
 *	newstats			(stat change)
 *	mus_dc				(player has been disconnected from Discord)
 *	mus_next			(player has finished playing the current song)
 *	mus_playing			(bot is now playing)
 *	mus_stopped			(bot is now stopped)
 *	mus_loading			(bot is loading)
 *	mus_msg				(display toast)
 *	youmay				(you may now do stuff -- rate limiting
 *						IMPORTANT: SHOULD ALSO BE RATE LIMITED SERVER-SIDE)
 *
 *	Emitting events: THESE ARE ALL RATE LIMITED
 *	queueresort			(queue order changed)
 *	skip				(obvious)
 *	
 *	
 *	
 */




sortable('#left');


