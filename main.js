var Botkit = require('botkit');
var os = require('os');
var controller = Botkit.slackbot();
var bot = controller.spawn({
	// spooky slack token
  // token: ""
})
var owners = ["user1", "user2"];
bot.startRTM(function(err, bot, payload) {
	if (err) {
		throw new Error('Could not connect to Slack');
	}
	controller.hears(["Status"], ["mention", "direct_message", "direct_mention"], function(bot, message) {
		bot.reply("All good!");
	});
	controller.hears(["code", "coding"], ["mention", "direct_message", "direct_mention", "ambient"], function(bot, message) {
		bot.reply("Go coding! Go CFC!");
	});
	controller.hears(['uptime'], ['direct_message,direct_mention,mention'], function(bot, message) {
		var hostname = os.hostname();
		var uptime = formatUptime(process.uptime());
		bot.reply(message, ':cfc: I have been running for ' + uptime + ' on ' + hostname + '.');
	});
	controller.hears(["shutdown"], ["direct_message", "ambient"], function(bot, message) {
		bot.startConversation(message, function(err, convo) {
			convo.ask('Are you sure you want me to shutdown?', [{
				pattern: bot.utterances.yes,
				callback: function(response, convo) {
					if (owners.indexOf(response.user) > -1) {
						convo.say('Shutting down... :robot_face:');
						convo.next();
						setTimeout(function() {
							process.exit();
						}, 3000);
					} else {
						convo.say("Permission denied :robot_face: - only Alex or Liam can shut me down!");
						convo.next();
					}
				}
			}, {
				pattern: bot.utterances.no,
				default: true,
				callback: function(response, convo) {
					convo.say('*Phew!*');
					convo.next();
				}
			}]);
		});
	});
	controller.hears(["."], ["mention", "direct_mention"], function(bot, message) {
		bot.botkit.log("New mention by " + message.user + " in " + message.channel + "! " + message.text);
	});

	function formatUptime(uptime) {
		var unit = 'second';
		if (uptime > 60) {
			uptime = uptime / 60;
			unit = 'minute';
		}
		if (uptime > 60) {
			uptime = uptime / 60;
			unit = 'hour';
		}
		if (uptime != 1) {
			unit = unit + 's';
		}

		uptime = uptime + ' ' + unit;
		return uptime;
	}
});
