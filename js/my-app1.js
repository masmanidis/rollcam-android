var $$ = Dom7;
var getPresets = [];
var	glevel = true;
 



var myApp = new Framework7({
    modalTitle: 'Rollcam',
    material: true,
	fastClicks: false, 
	notificationHold:1000, 
	macAddress: "AA:BB:CC:DD:EE:FF",  // get your mac address from bluetoothSerial.list
    chars: "",
	smartSelectOpenIn:'popup',
	batteryStatus:null
});
var $$ = Dom7;
// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
	domCache: true
});
Vue.config.devtools = true;
var vapp = new Vue({
  el: '#vapp',
  data: {
	tabSettingsActive: true,
	tabControlsActive: false,
	activeTabClass: 'tab-link font-tab button  button-raised button-fill active',
	tabClass: 'tab-link font-tab button  button-raised',
    devices: 'Connect'
  },
	methods: {
		tablink: function (event) {
			 
			var elems = document.querySelectorAll(".font-tab");
			$$.each(elems, function (index, value) {
				$$(value).removeClass('button-fill');
			}); 
			document.getElementById(event.currentTarget.id).classList.add("button-fill");	
		},
		useVideo: function (event) {
			var isChecked = $$('#useVideo').prop('checked');
			if(isChecked) {
				$$('#stepsToggle').html('Revolutions');
				$$('#moveAfterFlash').prop('checked', false);	
				$$('#useInfrared').prop('checked', false);	
				localStorage.setItem('video',$$('#useVideo').prop('checked') ? true:false);	
				localStorage.setItem('flash',false);	
				localStorage.setItem('infrared',false);	
				$$('#stepsFa').removeClass( "fa-step-forward" ).addClass("fa-circle-o-notch");
				$$('#smartSecPerRevol').show();
			} else {
				$$('#stepsToggle').html('Steps (for every movement)');
				$$('#stepsFa').removeClass( "fa-circle-o-notch" ).addClass( "fa-step-forward" );
				$$('#smartSecPerRevol').hide();
			}
			localStorage.setItem('video',$$('#useVideo').prop('checked') ? true:false);	
		},
		moveAfterFlash: function (event) {
			var isChecked = $$('#moveAfterFlash').prop('checked');
			if(isChecked) {
				$$('#useInfrared').prop('checked', false);	
				$$('#useVideo').prop('checked', false);	
				$$('#useVideo').trigger('click');
				$$('#stepsFa').removeClass( "fa-circle-o-notch" ).addClass( "fa-step-forward" );
				$$('#smartSecPerRevol').hide();
				localStorage.setItem('infrared',$$('#useInfrared').prop('checked') ? true:false);	
			}
			localStorage.setItem('flash',$$('#moveAfterFlash').prop('checked') ? true:false);	
		},
		useInfrared: function (event) {
			var isChecked = $$('#useInfrared').prop('checked');
			if(isChecked) {
				$$('#useVideo').prop('checked', false);	
				$$('#moveAfterFlash').prop('checked', false);	
				$$('#useVideo').trigger('click');
				$$('#smartSecPerRevol').hide();
				$$('#stepsFa').removeClass( "fa-circle-o-notch" ).addClass( "fa-step-forward" );
				$$('#secPerRevol').hide();
				localStorage.setItem('flash',$$('#moveAfterFlash').prop('checked') ? true:false);
			}
			 
			localStorage.setItem('infrared',$$('#useInfrared').prop('checked') ? true:false);	
		},
		runRollcam : function () {
			
			if( glevel ) {
			bluetoothSerial.isEnabled(
				function() {
					
					
					bluetoothSerial.isConnected(
						
						function() {
							
							$$("#stepDisplay").html(0);
							$$("#totalSteps").html($$('select[name="rollCamSteps"] option:checked')[0].value);
							var afterFlash = $$('#moveAfterFlash').prop('checked') ? 1:0;
							var useInfrared = $$('#useInfrared').prop('checked') ? 1:0;
							var useVideo = $$('#useVideo').prop('checked') ? 1:0;
							if( afterFlash == 0 ) {
								if(useInfrared == 1) {
									afterFlash = 2;
								} else if (useVideo == 1) {
									
									clearInterval(btItems.timer);
									btItems.startTimer();
									afterFlash = 3; // video
								}
							}
							bluetoothSerial.write(	$$('select[name="rollCamSteps"] option:checked')[0].value+","+
													$$('select[name="rollCamDelay"] option:checked')[0].value+","+afterFlash+"\n");
							$$('#tab2link').click();
							 
							if( afterFlash == 3 ) {
								$$("#timerClock").show();
								afterFlash = afterFlash + $$('select[name="secPerRevol"] option:checked')[0].value; 
								alert(afterFlash);
							} else {
								$$("#timerClock").hide(); 
								
							}
														
						},
						function() {
							myApp.alert("Device not connected yet");
							mainView.router.loadPage('bluetooth.html');
						}
					);
				},
				function() {
					mainView.router.loadPage('bluetooth.html');
					clearInterval(btItems.timer);
				});
			} else {
				clearInterval(btItems.timer);
				myApp.alert("Level error, rollcam is not flat");
			}
		},
		oneStepFw: function () {
			bluetoothSerial.write('f');
		},
		oneStepBack: function () {
			bluetoothSerial.write('b');
		},
		stop: function (event) {
			if(event.currentTarget.getAttribute("btnType") == "stop") {
				$$('#play_stop').removeClass('fa fa-stop fa-2x');
				$$('#play_stop').addClass('fa fa-play fa-2x');
				event.currentTarget.setAttribute("btnType","play");
				bluetoothSerial.write('s');
			} else {
				$$('#play_stop').removeClass('fa fa-play fa-2x');
				$$('#play_stop').addClass('fa fa-stop fa-2x');
				event.currentTarget.setAttribute("btnType","stop");
				bluetoothSerial.write('r');
			}
		}, 
		resets: function() {
			bluetoothSerial.write('w');
		},
		exit: function () {
			bluetoothSerial.write('e');
			$$('#tab1link').click();	
			$$("#stepDisplay").html("0");
			$$('#play_stop').removeClass('fa fa-play fa-2x');
			$$('#play_stop').addClass('fa fa-stop fa-2x');
			$$('a').attr('btnType', 'stop');
			clearInterval(btItems.timer);
		},
		
		init: function () {
			
			var stepsPos = 1;
			var delayPos = 1;
			if(localStorage.getItem('steps')) {
				stepsPos = localStorage.getItem('steps');
			} else {
				localStorage.setItem('steps',stepsPos);	
			}
			 
			$$("#rollCamSteps").val( stepsPos ).change();
			 
	
			
		/* 	rollCamSteps.open();
			rollCamSteps.setValue([steps[stepsPos]])
			rollCamSteps.close(); */
			if(localStorage.getItem('delay')) {
				delayPos = localStorage.getItem('delay');
			} else {
				localStorage.setItem('delay', 1);	
			}
			 
			$$("#rollCamDelay").val( delayPos ).change();
/* 			rollCamDelay.open();
			rollCamDelay.setValue([secs[delayPos]])
			rollCamDelay.close(); */
			if( localStorage.getItem('flash') ) {
				if( localStorage.getItem('flash') === 'true' ) 
						$$('#moveAfterFlash').prop('checked', true);
					else
						$$('#moveAfterFlash').prop('checked', false);
			} else {
				localStorage.setItem('flash',$$('#moveAfterFlash').prop('checked') ? true:false);	
			}
			if( localStorage.getItem('infrared') ) {
				if( localStorage.getItem('infrared') === 'true' ) 
						$$('#useInfrared').prop('checked', true);
					else
						$$('#useInfrared').prop('checked', false);
			} else {
				localStorage.setItem('infrared',$$('#useInfrared').prop('checked') ? true:false);	
			}
			if( localStorage.getItem('video') ) {
				if( localStorage.getItem('video') === 'true' ) 
						$$('#useVideo').prop('checked', true);
					else
						$$('#useVideo').prop('checked', false);
			} else {
				localStorage.setItem('video',$$('#useVideo').prop('checked') ? true:false);	
			}
			$$('#useVideo').trigger('click');
			myApp.initSmartSelects('.page[data-page=index]'); 
			 
		}
	}
});

function onLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
	document.addEventListener("backbutton", onBackKeyDown, false);
	document.addEventListener("batterystatus", onBatteryStatus, false);
}

function onBatteryStatus(status) {
	myApp.batteryStatus = status.level;
	myApp.addNotification({
		title: 'Battery Status',
		subtitle: 'Bluetooth Notifications',
		message: "Level: " + status.level + " isPlugged: " + status.isPlugged 
	});
}

function onBackKeyDown() {
	myApp.confirm('Are you sure to quit?', 
	  function () {
			 myApp.addNotification({
						title: 'Exit Rollcam',
						subtitle: 'Application',
						message: "Thank you for using Rollcam"
					});
			navigator.app.exitApp();
	  },
	  function () {
	  }
	);
	
}

	var steps = [1,2,3,4,5,6,8,9,10,12,15,18,20,24,30,36,40,45,60,72,90,120,180,360];
	let tmpListData = ''; 
	for (i = 0; i < steps.length; i++) {
		tmpListData += '<option value="'+steps[i]+'">'+steps[i]+'</option>';
	}
	 
	 
	$$("#rollCamSteps").html(tmpListData); 
	
	$$("#rollCamSteps").on('change', function(){
		localStorage.setItem('steps',this.value);
	});
	
/* var rollCamSteps = myApp.picker({
    input: '#rollCamSteps',
	divider: true,
	toolbarTemplate: 
        '<div class="toolbar">' +
            '<div class="toolbar-inner">' +
                '<div class="left">' +
                    '<a href="#" class="link toolbar-manual-link-reset">Reset</a>' +
                '</div>' +
                '<div class="right">' +
                    '<a href="#" class="link close-picker">Set Steps</a>' +
                '</div>' +
            '</div>' +
        '</div>',
	onChange: function (picker, values, displayValues) {
		var col = picker.cols[0];
		localStorage.setItem('steps',col.activeIndex);
		$$("#totalSteps").html(values[0]);
    },
	onOpen: function (picker) {
		picker.container.find('.toolbar-manual-link-reset').on('click', function () {
			picker.setValue([steps[0]]);
        });
    },
	formatValue: function (p, values, displayValues) {
        return displayValues[0]+" steps";
    },
    cols: [
		{
            values: steps
        }
    ]
}); */




	tmpListData = ''; 
	for (i = 0; i <61; i++) {
		tmpListData += '<option value="'+i+'">'+i+' '+(i==0 ? '- Manual Movements':'')+'</option>';
	}
	$$("#rollCamDelay").html(tmpListData); 
	$$("#rollCamDelay").on('change', function(){
		localStorage.setItem('delay',this.value);
	});
	myApp.initSmartSelects('.page[data-page=index]'); 
	let secs = [0];
	for (i = 1; i < 61; i++) {
		secs.push(i);
}/*
var rollCamDelay = myApp.picker({
    input: '#rollCamDelay',
	divider: true,
	toolbarTemplate: 
        '<div class="toolbar">' +
            '<div class="toolbar-inner">' +
                '<div class="left">' +
                    '<a href="#" class="link toolbar-manual-link close-picker">Manual</a>' +
                '</div>' +
                '<div class="right">' +
                    '<a href="#" class="link close-picker">Set Delay</a>' +
                '</div>' +
            '</div>' +
        '</div>',
	onChange: function (picker, values, displayValues) {
		var col = picker.cols[0];
		localStorage.setItem('delay',col.activeIndex);	
    },
	onOpen: function (picker) {
		picker.container.find('.toolbar-manual-link').on('click', function () {
			picker.setValue([secs[0]]);
        });
    },
	formatValue: function (p, values, displayValues) {
        return displayValues[0]+" secs"; 
    },
    cols: [
		{
            values: secs
        }
    ]
}); */
vapp.init();
myApp.onPageInit('bluetooth', function (page) {
	 btItems = new Vue({
		el: '#btItems',
		timer:null, 
		data: {items: [],
			macAddress: null, // Will be updated when the select value change
			macName: null
		 },
		 methods: {
			connect: function (event) {
				this.macAddress = event.currentTarget.getAttribute("macAddress");
				this.macName = event.currentTarget.getAttribute("macName");
				this.manageConnection();
			},
			bluetoothEnable : function () {
				var me = this;
				bluetoothSerial.enable(
					function() {
						me.display("Bluetooth is enabled");
						me.isEnabled();
					},
					function() {
						me.display("The user did *not* enable Bluetooth");
					}
				);
				
			},
			listPorts: function(event) {
				bluetoothSerial.list(
					function(results) {
						btItems._data.items = results;
					},
					function(error) {
						btItems._data.items = error;
					}
				)
			},
			isEnabled: function (event) {
				bluetoothSerial.isEnabled(this.listPorts,this.notEnabled);
			},
			notEnabled: function () {
				var me = this;
					myApp.confirm('Bluetooth is not enabled.', 
					  function () {
						me.bluetoothEnable();	 
					  },
					  function () {
						myApp.alert("Rollcam need a bluetooth connection!!!!");
					  }
					);
			},
			manageConnection: function() {
				var me = this;
				// connect() will get called only if isConnected() (below)
				// returns failure. In other words, if not connected, then connect:
				var connect = function () {
					// if not connected, do this:
					// clear the screen and display an attempt to connect
					 
					me.display("Attempting to connect. " + me.macName+ " "+ me.macAddress);
					// attempt to connect:
					bluetoothSerial.connect(
						me.macAddress,  // device to connect to
						me.openPort,    // start listening if you succeed
						me.showError    // show the error if you fail
					);
				};

				// disconnect() will get called only if isConnected() (below)
				// returns success  In other words, if  connected, then disconnect:
				var disconnect = function () {
					
					me.display("attempting to disconnect");
					// if connected, do this:
					bluetoothSerial.disconnect(
						me.closePort,     // stop listening to the port
						me.showError      // show the error if you fail
					);
				};

				// here's the real action of the manageConnection function:
				bluetoothSerial.isConnected(disconnect, connect);
			},
			/*
				subscribes to a Bluetooth serial listener for newline
				and changes the button:
			*/
				openPort: function() {
					var me=this;
					me.display("Connected to: " + me.macName+ " "+ me.macAddress);
					bluetoothSerial.subscribe('\n', function (data) {
						if(!isNaN(parseInt(data))) {
						 
							if( data == 999 ) {
								glevel = false;
								
							} else {
								glevel = true;
							}
							$$("#stepDisplay").html(data);
							clearInterval(me.timer); 
							me.startTimer();
						}
					});
					setTimeout(function(){  
						mainView.router.back();
					}, 1500);
				},

			/*
				unsubscribes from any Bluetooth serial listener and changes the button:
			*/
				closePort: function() {
					var me = this;
					me.display("Disconnected from: " + me.macName+ " "+ me.macAddress);
					bluetoothSerial.unsubscribe(
							function (data) {
								me.display(data);
							},
							me.showError
					);
				},
				pad: function (val) {
					return val > 9 ? val : "0" + val; 
				},
				startTimer: function(){
					var me = this;					
					var sec = 0;
					me.timer =	setInterval( function(){
							document.getElementById("seconds").innerHTML=me.pad(++sec%60);
							document.getElementById("minutes").innerHTML=me.pad(parseInt(sec/60,10));
						}, 1000);
				},
				showError: function(error) {
					var me = this;
					me.display("Rollcam "+ error);
				},
				display: function(message) {
					var me = this;
					 myApp.addNotification({
						title: me.macName+' Connection Management',
						subtitle: 'Bluetooth Notifications',
						message: message,
						media: '<i class="icon icon-f7"></i>'
					});
				}
		  }
	});
	btItems.isEnabled();
	clearInterval(btItems.timer);
});

myApp.onPageInit('edit_presets', function (page) {
	 
	var editPresetsItems = new Vue({
		el: '#edit-presets-popup',
		data: {
			selectedDelay:'',
			selectedSteps:'',
			presetTitle:'',
			selectedOptions: {
				steps:steps,
				delay:secs
			}
		 },
		 methods: {
			editPresetsInit: function() {
				var vm =  this;
				vm.selectedSteps = getPresets[page.query.id].steps;
				vm.selectedDelay = getPresets[page.query.id].delay;
				vm.presetTitle = getPresets[page.query.id].title;
			},
			presetCancel: function (event) {
				mainView.router.back();
			},
			presetSave: function (event) {
				var vm =  this;
				getPresets[page.query.id].steps = vm.selectedSteps;
				getPresets[page.query.id].delay = vm.selectedDelay;
				if(vm.presetTitle != '')
				getPresets[page.query.id].title = vm.presetTitle;
				localStorage.setItem('presets', JSON.stringify(getPresets));
				mainView.router.back(); 
			}
		}
	});
	editPresetsItems.editPresetsInit();
});

myApp.onPageInit('presets_list', function (page) {
	if(!localStorage.getItem('presets')) {
		var presets = [	 
						{pos:0, title:'Program 1', 	steps:4, 	delay:5},
						{pos:1, title:'Program 2', 	steps:8, 	delay:5},
						{pos:2, title:'Program 3', 	steps:12, 	delay:5},
						{pos:3, title:'Program 4', 	steps:16, 	delay:5},
						{pos:4, title:'Program 5', 	steps:20, 	delay:5},
						{pos:5, title:'Program 6', 	steps:24, 	delay:5},
						{pos:6, title:'Program 7', 	steps:30, 	delay:5},
						{pos:7, title:'Program 8', 	steps:36, 	delay:5},
						{pos:8, title:'Program 9', 	steps:40, 	delay:5},
						{pos:9, title:'Program 10', steps:45, 	delay:5}
					];
		localStorage.setItem('presets', JSON.stringify(presets));
	} 
	getPresets = JSON.parse(localStorage.getItem('presets'));
	var presetsItems = new Vue({
		el: '#presetsItems',
		data: {
			selectedPreset: '',
			items: getPresets
		 },
		 methods: {
			openSwipeout: function (event) {
				myApp.swipeoutOpen($$(".preset"+event.currentTarget.getAttribute("presetArrPos")), "right");
			},				
			selectPreset: function (event) {
				var vm = this;
				
				//alert(vm.$data.items[event.currentTarget.getAttribute("presetArrPos")].steps);
			 
				
				$$("#rollCamSteps").val( vm.$data.items[event.currentTarget.getAttribute("presetArrPos")].steps ).change();
				$$("#rollCamDelay").val( vm.$data.items[event.currentTarget.getAttribute("presetArrPos")].delay ).change();
				/* rollCamSteps.open();
				rollCamSteps.setValue([steps[steps.indexOf(vm.$data.items[event.currentTarget.getAttribute("presetArrPos")].steps)]]);
				rollCamSteps.close();
				rollCamDelay.open();
				rollCamDelay.setValue([secs[secs.indexOf(vm.$data.items[event.currentTarget.getAttribute("presetArrPos")].delay)]]);
				rollCamDelay.close(); */
				mainView.router.back();
				myApp.initSmartSelects('.page[data-page=index]'); 
			},
			selectEdit: function (event) {
				var vm = this;
				vm.selectedPreset = event.currentTarget.getAttribute("presetArrPos");
				mainView.router.load({
					url:'edit_presets.html?id='+event.currentTarget.getAttribute("presetArrPos")
				});
			}
		  }
	});
});