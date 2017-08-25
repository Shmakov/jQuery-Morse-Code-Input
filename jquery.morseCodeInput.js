/*
 * jQuery Morse Code Input Plugin
 * https://github.com/Shmakov/jQuery-Morse-Code-Input
 *
 * Copyright 2017 Nikolay Shmakov
 * Licensed under the MIT license
 */
(function($) {
	var MorseCodeInput =
	{
		dot_duration: 100,
		input_started: false,
		input_value: '',
		text_value: '',
		short_gap_timer: null,
		active_element: null,
		down_date: null,
		up_date: null,
		down_timer: null,
		_code: {".-": "A","-...": "B","-.-.": "C","-..": "D",".": "E","..-.": "F","--.": "G","....": "H","..": "I",".---": "J","-.-": "K",".-..": "L","--": "M","-.": "N","---": "O",".--.": "P","--.-": "Q",".-.": "R","...": "S","-": "T","..-": "U","...-": "V",".--": "W","-..-": "X","-.--": "Y","--..": "Z","-----": "0",".----": "1","..---": "2","...--": "3","....-": "4",".....": "5","-....": "6","--...": "7","---..": "8", "----.": "9", "._._._": ".", "__..__": ",", "..__..": "?", ".____.": "'", "_.._.": "/", "_.__.": "(", "_.__._": ")", "._...": "&", "___...": ":", "_._._.": ";", "_..._": "=", "._._.": "+", "_...._": "-", "..__._": "_", "._.._.": "\"", "..._.._": "$", "_._.__": "!", ".__._.": "@"},

		down: function()
		{
			if (MorseCodeInput.down_date !== null) return;

			MorseCodeInput.short_gap_test();
			if (MorseCodeInput.input_started === false) {
				MorseCodeInput.input_started = true;
				MorseCodeInput.short_gap_timer = window.setTimeout(MorseCodeInput.input_ends, MorseCodeInput.dot_duration * 3);
			}

			MorseCodeInput.down_timer = window.setTimeout(function(){ $('#morse-code-input-div .circle-big').show(); }, MorseCodeInput.dot_duration);

			MorseCodeInput.down_date = new Date();

			/* Test for space */
			if (MorseCodeInput.up_date !== null && (duration = (new Date()) - MorseCodeInput.up_date) && duration  > MorseCodeInput.dot_duration * 10 && duration < MorseCodeInput.dot_duration * 25) {
				MorseCodeInput.text_value+= ' ';
				$('#morse-code-input-text > div').text(MorseCodeInput.text_value);
				MorseCodeInput.up_date = null;
			}

			$('#morse-code-input-div .circle-small').show();
			$('#morse-code-input-div .hint').hide();
		},

		up: function()
		{
			var duration = (new Date()) - MorseCodeInput.down_date;

			if (MorseCodeInput.input_started && duration > 5 && duration <= MorseCodeInput.dot_duration) {
				MorseCodeInput.short_gap_test();
				MorseCodeInput.input_value+= '.';
				MorseCodeAudio.play_dot();
			}
			else if (MorseCodeInput.input_started && (duration > MorseCodeInput.dot_duration)) {
				MorseCodeInput.short_gap_test();
				MorseCodeInput.input_value+= '-';
				MorseCodeAudio.play_dash();
			}
			$('#morse-code-input-div .input-dots').text(MorseCodeInput.input_value);

			MorseCodeInput.down_date = null;
			if (MorseCodeInput.down_timer !== null) window.clearTimeout(MorseCodeInput.down_timer);

			MorseCodeInput.up_date = new Date();

			$('#morse-code-input-div .circle-small').hide();
			$('#morse-code-input-div .circle-big').hide();
		},

		backspace_down: function()
		{
			if (MorseCodeInput.text_value != '') {
				MorseCodeInput.text_value = MorseCodeInput.text_value.slice(0, -1);
				$('#morse-code-input-text > div').text(MorseCodeInput.text_value);
			}
		},

		short_gap_test: function()
		{
			if (MorseCodeInput.input_started && MorseCodeInput.short_gap_timer !== null) {
				window.clearTimeout(MorseCodeInput.short_gap_timer);
				MorseCodeInput.short_gap_timer = window.setTimeout(MorseCodeInput.input_ends, MorseCodeInput.dot_duration * 3);
			}
		},

		input_ends: function()
		{
			if (MorseCodeInput.input_value !== '') {
				if (MorseCodeInput._code[MorseCodeInput.input_value]) {
					MorseCodeInput.text_value+= MorseCodeInput._code[MorseCodeInput.input_value];
					$('#morse-code-input-text > div').text(MorseCodeInput.text_value);
				}
			}

			if (MorseCodeInput.short_gap_timer !== null) window.clearTimeout(MorseCodeInput.short_gap_timer);

			MorseCodeInput.input_started = false;
			MorseCodeInput.input_value = '';
			$('#morse-code-input-div .input-dots').text(MorseCodeInput.input_value);
		},

		activate: function(element)
		{
			MorseCodeInput.active_element = element;

			MorseCodeInput.text_value = MorseCodeInput.active_element.val();

			var html = '';
			html+= '<div id="morse-code-input-header"><div>Morse Code Input</div><small>(press any key or tap to start typing)</small><button type="button" class="overlay-close">✖</button></div>';
			html+= '<div id="morse-code-input-text"><div>' + MorseCodeInput.text_value + '</div></div>';
			html+= '<div id="morse-code-input-div"><div class="hint">Tap Here to Type</div><div class="circle-small"></div><div class="circle-big"></div><div class="input-dots"></div></div>';
			$("body").prepend("<div id='morse-code-input-overlay'>" + html + "</div>");
		},

		destroy: function()
		{
			MorseCodeInput.active_element.val(MorseCodeInput.text_value);
			MorseCodeInput.active_element = null;
			$("#morse-code-input-overlay").remove();
		}
	};

	var MorseCodeAudio =
	{
		audio_context: null,
		gain: null,
		init: function()
		{
			if (!(window.AudioContext || window.webkitAudioContext)) return;
			this.audio_context = new (window.AudioContext || window.webkitAudioContext)();
			var oscillator = this.audio_context.createOscillator();
			this.gain = this.audio_context.createGain();
			this.gain.gain.value = 0;
			oscillator.frequency.value = 750;
			oscillator.connect(this.gain);
			oscillator.start(0);
			this.gain.connect(this.audio_context.destination);
		},
		play_dot: function(){
			if (MorseCodeAudio.audio_context === null) return;
			var time = this.audio_context.currentTime;
			this.gain.gain.setValueAtTime(1.0, time);
			this.gain.gain.setValueAtTime(0.0, time + (1.2 / 20));
		},
		play_dash: function(){
			if (MorseCodeAudio.audio_context === null) return;
			var time = this.audio_context.currentTime;
			this.gain.gain.setValueAtTime(1.0, time);
			this.gain.gain.setValueAtTime(0.0, time + (1.2 / 20) * 3);
		}
	};

	MorseCodeAudio.init();

	$.fn.morseCodeInput = function() {
		return this.each(function() {
			var input = $(this);

			input.on("click focus paste", function () {
				if (!MorseCodeInput.active_element) {
					MorseCodeInput.activate(input);
				}
				$(this).blur();
			});
		});
	};

	$.fn.morseCodeInput.isActive = function(){
		return (MorseCodeInput.active_element !== null);
	};

	$(document).keydown(function(e){
		if (!$.fn.morseCodeInput.isActive()) return;
		e.preventDefault();

		if (e.keyCode == 27) { // Esc Key
			MorseCodeInput.destroy();
			return;
		}
		if (e.keyCode == 8) { // Backspace Key
			MorseCodeInput.backspace_down();
			return;
		}

		if (e.ctrlKey || e.altKey || e.metaKey) return;

		MorseCodeInput.down();
	});
	$(document).keyup(function(e){
		if (!$.fn.morseCodeInput.isActive()) return;
		e.preventDefault();

		if (e.keyCode == 27 || e.keyCode == 8 || e.ctrlKey || e.altKey || e.metaKey) return;

		MorseCodeInput.up();
	});
	$(document).on('mousedown touchstart', '#morse-code-input-div', function(e){
		MorseCodeInput.down();
	});
	$(document).on('mouseup touchend', '#morse-code-input-div', function(e){
		MorseCodeInput.up();
	});
	$(document).on('click', '.overlay-close', function(e){
		MorseCodeInput.destroy();
	});

}(jQuery));