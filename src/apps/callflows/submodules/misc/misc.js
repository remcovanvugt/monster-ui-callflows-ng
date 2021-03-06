define(function(require){
	var $ = require('jquery'),
		_ = require('underscore'),
		monster = require('monster');

	var app = {
		requests: {},

		subscribe: {
			'callflows.fetchActions': 'miscDefineActions'
		},

		miscGetGroupPickupData: function(callback) {
			var self = this;

			monster.parallel({
					groups: function(callback) {
						self.miscGroupList(function(data) {
							callback(null, data);
						});
					},
					users: function(callback) {
						self.miscUserList(function(data) {
							_.each(data, function(user) {
								user.name = user.first_name + ' ' + user.last_name;
							});
							callback(null, data);
						});
					},
					devices: function(callback) {
						self.miscDeviceList(function(data) {
							callback(null, data);
						});
					}
				},
				function(err, results) {
					callback && callback(results);
				}
			);
		},

		miscDefineActions: function(args) {
			var self = this,
				callflow_nodes = args.actions;

			$.extend(callflow_nodes, {
				'root': {
					name: 'Root',
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable : 'false'
				},
				'callflow[id=*]': {
					name: self.i18n.active().oldCallflows.callflow,
					icon: 'share-alt',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'callflow',
					tip: self.i18n.active().oldCallflows.callflow_tip,
					data: {
						id: 'null'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 20,
					caption: function(node, caption_map) {
						var id = node.getMetadata('id'),
							return_value = '';

						if(id in caption_map) {
							if(caption_map[id].hasOwnProperty('name')) {
								return_value = caption_map[id].name;
							}
							else if(caption_map[id].hasOwnProperty('numbers')) {
								return_value = caption_map[id].numbers.toString();
							}
						}

						return return_value;
					},
					edit: function(node, callback) {
						self.callApi({
							resource: 'callflow.list',
							data: {
								accountId: self.accountId,
								filters: { paginate:false }
							},
							success:function(data, status) {
								var popup, popup_html, _data = [];

								$.each(data.data, function() {
									if(!this.featurecode && this.id !== self.flow.id) {
										this.name = this.name ? this.name : ((this.numbers) ? this.numbers.toString() : self.i18n.active().oldCallflows.no_numbers);

										_data.push(this);
									}
								});

								popup_html = $(monster.template(self, 'callflow-edit_dialog', {
									objects: {
										type: 'callflow',
										items: _.sortBy(_data, 'name'),
										selected: node.getMetadata('id') || ''
									}
								}));

								$('#add', popup_html).click(function() {
									node.setMetadata('id', $('#object-selector', popup_html).val());

									node.caption = $('#object-selector option:selected', popup_html).text();

									popup.dialog('close');
								});

								popup = monster.ui.dialog(popup_html, {
									title: self.i18n.active().oldCallflows.callflow_title,
									beforeClose: function() {
										if(typeof callback == 'function') {
											callback();
										}
									}
								});
							}
						});
					}
				},
				'do_not_disturb[action=activate]': {
					name: self.i18n.active().callflows.doNotDisturb.activate.label,
					icon: 'bell-slash',
					category: self.i18n.active().callflows.doNotDisturb.categoryName,
					module: 'do_not_disturb',
					tip: self.i18n.active().callflows.doNotDisturb.activate.tip,
					data: {
						action: 'activate'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 1,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						if (typeof callback === 'function') {
							callback();
						}
					}
				},
				'do_not_disturb[action=deactivate]': {
					name: self.i18n.active().callflows.doNotDisturb.deactivate.label,
					icon: 'bell-slash',
					category: self.i18n.active().callflows.doNotDisturb.categoryName,
					module: 'do_not_disturb',
					tip: self.i18n.active().callflows.doNotDisturb.deactivate.tip,
					data: {
						action: 'deactivate'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 2,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						if (typeof callback === 'function') {
							callback();
						}
					}
				},
				'do_not_disturb[action=toggle]': {
					name: self.i18n.active().callflows.doNotDisturb.toggle.label,
					icon: 'bell-slash',
					category: self.i18n.active().callflows.doNotDisturb.categoryName,
					module: 'do_not_disturb',
					tip: self.i18n.active().callflows.doNotDisturb.toggle.tip,
					data: {
						action: 'toggle'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 3,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						if (typeof callback === 'function') {
							callback();
						}
					}
				},
				'call_forward[action=activate]': {
					name: self.i18n.active().oldCallflows.enable_call_forwarding,
					icon: 'mail-reply',
					category: self.i18n.active().oldCallflows.call_forwarding_cat,
					module: 'call_forward',
					tip: self.i18n.active().oldCallflows.enable_call_forwarding_tip,
					data: {
						action: 'activate'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 10,
					caption: function(node, caption_map) {
						return '';
					},
					edit: function(node, callback) {
						if(typeof callback == 'function') {
							callback();
						}
					}
				},
				'call_forward[action=deactivate]': {
					name: self.i18n.active().oldCallflows.disable_call_forwarding,
					icon: 'mail-reply',
					category: self.i18n.active().oldCallflows.call_forwarding_cat,
					module: 'call_forward',
					tip: self.i18n.active().oldCallflows.disable_call_forwarding_tip,
					data: {
						action: 'deactivate'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 20,
					caption: function(node, caption_map) {
						return '';
					},
					edit: function(node, callback) {
						if(typeof callback == 'function') {
							callback();
						}
					}
				},
				'call_forward[action=update]': {
					name: self.i18n.active().oldCallflows.update_call_forwarding,
					icon: 'mail-reply',
					category: self.i18n.active().oldCallflows.call_forwarding_cat,
					module: 'call_forward',
					tip: self.i18n.active().oldCallflows.update_call_forwarding_tip,
					data: {
						action: 'update'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 30,
					caption: function(node, caption_map) {
						return '';
					},
					edit: function(node, callback) {
						if(typeof callback == 'function') {
							callback();
						}
					}
				},
				'dynamic_cid[]': {
					name: self.i18n.active().oldCallflows.dynamic_cid,
					icon: 'mail-reply',
					category: self.i18n.active().oldCallflows.caller_id_cat,
					module: 'dynamic_cid',
					tip: self.i18n.active().oldCallflows.dynamic_cid_tip,
					isUsable: 'true',
					weight: 10,
					caption: function(node, caption_map) {
						return '';
					},
					edit: function(node, callback) {
						if(typeof callback == 'function') {
							callback();
						}
					}
				},
				'prepend_cid[action=prepend]': {
					name: self.i18n.active().oldCallflows.prepend,
					icon: 'plus-circle',
					category: self.i18n.active().oldCallflows.caller_id_cat,
					module: 'prepend_cid',
					tip: self.i18n.active().oldCallflows.prepend_tip,
					data: {
						action: 'prepend',
						caller_id_name_prefix: '',
						caller_id_number_prefix: '',
						apply_to: 'original'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 20,
					caption: function(node, caption_map) {
						return (node.getMetadata('caller_id_name_prefix') || '') + ' ' + (node.getMetadata('caller_id_number_prefix') || '');
					},
					edit: function(node, callback) {
						var popup, popup_html;

						popup_html = $(monster.template(self, 'misc-prepend_cid_callflow', {
							data_cid: {
								'caller_id_name_prefix': node.getMetadata('caller_id_name_prefix') || '',
								'caller_id_number_prefix': node.getMetadata('caller_id_number_prefix') || '',
								'apply_to': node.getMetadata('apply_to') || ''
							}
						}));

						$('#add', popup_html).click(function() {
							var cid_name_val = $('#cid_name_prefix', popup_html).val(),
								cid_number_val = $('#cid_number_prefix', popup_html).val(),
								apply_to_val = $('#apply_to', popup_html).val();

							node.setMetadata('caller_id_name_prefix', cid_name_val);
							node.setMetadata('caller_id_number_prefix', cid_number_val);
							node.setMetadata('apply_to', apply_to_val);

							node.caption = cid_name_val + ' ' + cid_number_val;

							popup.dialog('close');
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().oldCallflows.prepend_caller_id_title,
							beforeClose: function() {
								if(typeof callback == 'function') {
									 callback();
								}
							}
						});

						monster.ui.tooltips(popup);

						if (typeof callback === 'function') {
							callback();
						}
					}
				},
				'prepend_cid[action=reset]': {
					name: self.i18n.active().oldCallflows.reset_prepend,
					icon: 'undo',
					category: self.i18n.active().oldCallflows.caller_id_cat,
					module: 'prepend_cid',
					tip: self.i18n.active().oldCallflows.reset_prepend_tip,
					data: {
						action: 'reset'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 30,
					caption: function(node, caption_map) {
						return '';
					},
					edit: function(node, callback) {
						if(typeof callback == 'function') {
							callback();
						}
					}
				},
				'manual_presence[]': {
					name: self.i18n.active().oldCallflows.manual_presence,
					icon: 'lightbulb-o',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'manual_presence',
					tip: self.i18n.active().oldCallflows.manual_presence_tip,
					data: {
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 40,
					caption: function(node, caption_map) {
						return node.getMetadata('presence_id') || '';
					},
					edit: function(node, callback) {
						var popup_html = $(monster.template(self, 'presence-callflowEdit', {
								data_presence: {
									'presence_id': node.getMetadata('presence_id') || '',
									'status': node.getMetadata('status') || 'busy'
								}
							})),
							popup;

						$('#add', popup_html).click(function() {
							var presence_id = $('#presence_id_input', popup_html).val();
							node.setMetadata('presence_id', presence_id);
							node.setMetadata('status', $('#presence_status option:selected', popup_html).val());

							node.caption = presence_id;

							popup.dialog('close');
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().oldCallflows.manual_presence_title,
							beforeClose: function() {
								if(typeof callback == 'function') {
									 callback();
								}
							}
						});
					}
				},
				'language[]': {
					name: self.i18n.active().oldCallflows.language,
					icon: 'language',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'language',
					tip: self.i18n.active().oldCallflows.language_tip,
					data: {
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 50,
					caption: function(node, caption_map) {
						return node.getMetadata('language') || '';
					},
					edit: function(node, callback) {
						var popup, popup_html;

						popup_html = $(monster.template(self, 'misc-language', {
							data_language: {
								'language': node.getMetadata('language') || ''
							}
						}));

						$('#add', popup_html).click(function() {
							var language = $('#language_id_input', popup_html).val();
							node.setMetadata('language', language);
							node.caption = language;

							popup.dialog('close');
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().oldCallflows.language_title,
							beforeClose: function() {
								if(typeof callback == 'function') {
									 callback();
								}
							}
						});
					}
				},
				'group_pickup[]': {
					name: self.i18n.active().oldCallflows.group_pickup,
					icon: 'hand-pointer-o',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'group_pickup',
					tip: self.i18n.active().oldCallflows.group_pickup_tip,
					data: {
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '0'
						}
					],
					isUsable: 'true',
					weight: 60,
					caption: function(node, caption_map) {
						return node.getMetadata('name') || '';
					},
					edit: function(node, callback) {
						self.miscGetGroupPickupData(function(results) {
							var popup, popup_html;

							popup_html = $(monster.template(self, 'misc-group_pickup', {
								data: {
									items: results,
									selected: node.getMetadata('device_id') || node.getMetadata('group_id') || node.getMetadata('user_id') || ''
								}
							}));

							$('#add', popup_html).click(function() {
								var selector = $('#endpoint_selector', popup_html),
									id = selector.val(),
									name = selector.find('#'+id).html(),
									type = $('#'+ id, popup_html).parents('optgroup').data('type'),
									type_id = type.substring(type, type.length - 1) + '_id';

								/* Clear all the useless attributes */
								node.data.data = {};
								node.setMetadata(type_id, id);
								node.setMetadata('name', name);

								node.caption = name;

								popup.dialog('close');
							});

							popup = monster.ui.dialog(popup_html, {
								title: self.i18n.active().oldCallflows.select_endpoint_title,
								beforeClose: function() {
									callback && callback();
								}
							});
						});
					}
				},
				'receive_fax[]': {
					name: self.i18n.active().oldCallflows.receive_fax,
					icon: 'hand-pointer-o',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'receive_fax',
					tip: self.i18n.active().oldCallflows.receive_fax_tip,
					data: {
						owner_id: null
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '0'
						}
					],
					isUsable: 'true',
					weight: 70,
					caption: function(node, caption_map) {
						return '';
					},
					edit: function(node, callback) {
						self.miscUserList(function(data, status) {
							var popup, popup_html;

							$.each(data, function() {
								this.name = this.first_name + ' ' + this.last_name;
							});

							popup_html = $(monster.template(self, 'fax-callflowEdit', {
								objects: {
									items: data,
									selected: node.getMetadata('owner_id') || '',
									t_38: node.getMetadata('media') && node.getMetadata('media').fax_option || false
								}
							}));

							if($('#user_selector option:selected', popup_html).val() == undefined) {
								$('#edit_link', popup_html).hide();
							}

							$('.inline_action', popup_html).click(function(ev) {
								var _data = ($(this).data('action') == 'edit') ?
												{ id: $('#user_selector', popup_html).val() } : {};

								ev.preventDefault();

								monster.pub('callflows.user.popupEdit', {
									data:  _data,
									callback: function(_data) {
										node.setMetadata('owner_id', _data.id || 'null');

										popup.dialog('close');
									}
								});
							});

							$('#add', popup_html).click(function() {
								node.setMetadata('owner_id', $('#user_selector', popup_html).val());
								node.setMetadata('media', {
									fax_option: $('#t_38_checkbox', popup_html).is(':checked')
								});
								popup.dialog('close');
							});

							popup = monster.ui.dialog(popup_html, {
								title: self.i18n.active().oldCallflows.select_user_title,
								minHeight: '0',
								beforeClose: function() {
									if(typeof callback == 'function') {
										callback();
									}
								}
							});
						});
					}
				},
				'record_call[action=start]': {
					name: self.i18n.active().oldCallflows.start_call_recording,
					icon: 'comments',
					category: self.i18n.active().oldCallflows.call_recording_cat,
					module: 'record_call',
					tip: self.i18n.active().oldCallflows.start_call_recording_tip,
					data: {
						action: 'start'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 10,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						var popup_html = $(monster.template(self, 'recordCall-callflowEdit', {
								data_call_record: {
									'format': node.getMetadata('format') || 'mp3',
									'url': node.getMetadata('url') || '',
									'time_limit': node.getMetadata('time_limit') || '600'
								}
							})),
							popup;

						$('#add', popup_html).click(function() {
							node.setMetadata('url', $('#url', popup_html).val());
							node.setMetadata('format', $('#format', popup_html).val());
							node.setMetadata('time_limit', $('#time_limit', popup_html).val());

							popup.dialog('close');
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().oldCallflows.start_call_recording,
							minHeight: '0',
							beforeClose: function() {
								if(typeof callback == 'function') {
									 callback();
								}
							}
						});
					}
				},
				'record_call[action=stop]': {
					name: self.i18n.active().oldCallflows.stop_call_recording,
					icon: 'comments',
					category: self.i18n.active().oldCallflows.call_recording_cat,
					module: 'record_call',
					tip: self.i18n.active().oldCallflows.stop_call_recording_tip,
					data: {
						action: 'stop'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 20,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
					}
				},
				'pivot[]': {
					name: self.i18n.active().oldCallflows.pivot,
					icon: 'comments',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'pivot',
					tip: self.i18n.active().oldCallflows.pivot_tip,
					data: {
						method: 'get',
						req_timeout: '5',
						req_format: 'twiml',
						voice_url: ''
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '0'
						}
					],
					isUsable: 'true',
					weight: 80,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						var popup, popup_html;

						popup_html = $(monster.template(self,'misc-pivot', {
							data_pivot: {
								'method': node.getMetadata('method') || 'get',
								'voice_url': node.getMetadata('voice_url') || '',
								'req_timeout': node.getMetadata('req_timeout') || '5',
								'req_format': node.getMetadata('req_format') || 'twiml'
							}
						}));

						$('#add', popup_html).click(function() {
							node.setMetadata('voice_url', $('#pivot_voiceurl_input', popup_html).val());
							node.setMetadata('method', $('#pivot_method_input', popup_html).val());
							node.setMetadata('req_format', $('#pivot_format_input', popup_html).val());

							popup.dialog('close');
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().oldCallflows.pivot_title,
							minHeight: '0',
							beforeClose: function() {
								if(typeof callback == 'function') {
									 callback();
								}
							}
						});
					}
				},
				'disa[]': {
					name: self.i18n.active().oldCallflows.disa,
					icon: 'comments',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'disa',
					tip: self.i18n.active().oldCallflows.disa_tip,
					data: {
						pin: '',
						use_account_caller_id: true
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '0'
						}
					],
					isUsable: 'true',
					weight: 90,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						var popup, popup_html;

						popup_html = $(monster.template(self,'misc-disa', {
							data_disa: {
								'pin': node.getMetadata('pin'),
								'retries': node.getMetadata('retries'),
								'interdigit': node.getMetadata('interdigit'),
								'max_digits': node.getMetadata('max_digits'),
								'preconnect_audio': node.getMetadata('preconnect_audio'),
								'use_account_caller_id': node.getMetadata('use_account_caller_id')
							}
						}));

						monster.ui.tooltips(popup_html);

						$('#add', popup_html).click(function() {
							var save_disa = function() {
								var setData = function(field, value) {
										if(value !== 'default') {
											node.setMetadata(field, value);
										}
										else {
											node.deleteMetadata(field);
										}
									};

								setData('pin', $('#disa_pin_input', popup_html).val());
								setData('retries', $('#disa_retries_input', popup_html).val());
								setData('interdigit', $('#disa_interdigit_input', popup_html).val());
								setData('preconnect_audio', $('#preconnect_audio', popup_html).val());
								setData('use_account_caller_id', !$('#disa_keep_original_caller_id', popup_html).is(':checked'));
								setData('max_digits', $('#disa_max_digits_input', popup_html).val());

								popup.dialog('close');
							};
							if($('#disa_pin_input', popup_html).val() == '') {
								monster.ui.confirm(self.i18n.active().oldCallflows.not_setting_a_pin, function() {
									save_disa();
								});
							}
							else {
								save_disa();
							}
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().callflows.disa.title,
							beforeClose: function() {
								if(typeof callback == 'function') {
									 callback();
								}
							}
						});
					}
				},
				'collect_dtmf[]': {
					name: self.i18n.active().callflows.collectDTMF.title,
					icon: 'comments',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'collect_dtmf',
					tip: self.i18n.active().callflows.collectDTMF.tip,
					data: {
						pin: '',
						use_account_caller_id: true
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 90,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						var popup, popup_html;

						popup_html = $(monster.template(self, 'misc-collect-dtmf', {
							data_dtmf: {
								'interdigit_timeout': node.getMetadata('interdigit_timeout') || '',
								'collection_name': node.getMetadata('collection_name') || '',
								'max_digits': node.getMetadata('max_digits') || '',
								'terminator': node.getMetadata('terminator') || '#',
								'timeout': node.getMetadata('timeout') || '5000'
							}
						}));

						monster.ui.tooltips(popup_html);

						$('#add', popup_html).click(function() {
							var setData = function(field, value) {
								if (value !== 'default' && value !== '') {
									node.setMetadata(field, value);
								} else {
									node.deleteMetadata(field);
								}
							};

							setData('interdigit_timeout', $('#collect_dtmf_interdigit_input', popup_html).val());
							setData('collection_name', $('#collect_dtmf_collection_input', popup_html).val());
							setData('max_digits', $('#collect_dtmf_max_digits_input', popup_html).val());
							setData('terminator', $('#collect_dtmf_terminator_input', popup_html).val());
							setData('timeout', $('#collect_dtmf_timeout_input', popup_html).val());

							popup.dialog('close');
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().callflows.collectDTMF.title,
							beforeClose: function() {
								if (typeof callback === 'function') {
									callback();
								}
							}
						});
					}
				},
				'sleep[]': {
					name: self.i18n.active().callflows.sleep.name,
					icon: 'commenting',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'sleep',
					tip: self.i18n.active().callflows.sleep.tip,
					data: {
						duration: '',
						unit: 's'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 47,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						var popup, popup_html;

						popup_html = $(monster.template(self, 'misc-sleep', {
							data_sleep: {
								'duration': node.getMetadata('duration')
							}
						}));

						monster.ui.tooltips(popup_html);

						$('#add', popup_html).click(function() {
							var setData = function(field, value) {
								if (value !== 'default') {
									node.setMetadata(field, value);
								} else {
									node.deleteMetadata(field);
								}
							};

							setData('duration', $('#sleep_duration_input', popup_html).val());

							popup.dialog('close');
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().callflows.sleep.title,
							beforeClose: function() {
								if (typeof callback === 'function') {
									callback();
								}
							}
						});
					}
				},
				'tts[]': {
					name: self.i18n.active().callflows.tts.name,
					icon: 'comment',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'tts',
					tip: self.i18n.active().callflows.tts.tip,
					data: {
						text: ''
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 45,
					caption: function(node) {
						return '';
					},
					edit: function(node, callback) {
						var popup, popup_html;

						popup_html = $(monster.template(self, 'misc-tts', {
							data_tts: {
								'text': node.getMetadata('text'),
								'language': node.getMetadata('language'),
								'voice': node.getMetadata('voice')
							}
						}));

						monster.ui.tooltips(popup_html);

						$('#add', popup_html).click(function() {
							var setData = function(field, value) {
								if (value !== 'default') {
									node.setMetadata(field, value);
								} else {
									node.deleteMetadata(field);
								}
							};

							setData('text', $('#tts_text_input', popup_html).val());
							setData('language', $('#tts_language_input', popup_html).val());
							setData('voice', $('#tts_voice_input', popup_html).val());

							popup.dialog('close');
						});

						popup = monster.ui.dialog(popup_html, {
							title: self.i18n.active().callflows.tts.title,
							beforeClose: function() {
								if (typeof callback === 'function') {
									callback();
								}
							}
						});
					}
				},
				'response[]': {
					name: self.i18n.active().oldCallflows.response,
					icon: 'mail-reply',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'response',
					tip: self.i18n.active().oldCallflows.response_tip,
					data: {
						code: '',
						message: '',
						media: 'null'
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '0'
						}
					],
					isUsable: 'true',
					weight: 100,
					caption: function(node, caption_map) {
						return self.i18n.active().oldCallflows.sip_code_caption + node.getMetadata('code');
					},
					edit: function(node, callback) {
						self.miscMediaList(function(data) {
							var popup, popup_html;

							popup_html = $(monster.template(self, 'misc-response', {
								response_data: {
									items: data,
									media_enabled: node.getMetadata('media') ? true : false,
									selected_media: node.getMetadata('media') || '',
									code: node.getMetadata('code') || '',
									message: node.getMetadata('message') || ''
								}
							}));

							if($('#media_selector option:selected', popup_html).val() == undefined
							|| $('#media_selector option:selected', popup_html).val() == 'null') {
								$('#edit_link', popup_html).hide();
							}

							$('#media_selector', popup_html).change(function() {
								if($('#media_selector option:selected', popup_html).val() == undefined
								|| $('#media_selector option:selected', popup_html).val() == 'null') {
									$('#edit_link', popup_html).hide();
								} else {
									$('#edit_link', popup_html).show();
								}
							})

							$('.inline_action', popup_html).click(function(ev) {
								var _data = ($(this).data('action') == 'edit') ?
												{ id: $('#media_selector', popup_html).val() } : {};

								ev.preventDefault();

								monster.pub('callflows.media.editPopup', {
									data: _data,
									callback: function(_data) {
										node.setMetadata('media', _data.data.id || 'null');

										popup.dialog('close');
									}
								});
							});

							$('#add', popup_html).click(function() {
								if($('#response_code_input', popup_html).val().match(/^[1-6][0-9]{2}$/)) {
									node.setMetadata('code', $('#response_code_input', popup_html).val());
									node.setMetadata('message', $('#response_message_input', popup_html).val());
									if($('#media_selector', popup_html).val() && $('#media_selector', popup_html).val() != 'null') {
										node.setMetadata('media', $('#media_selector', popup_html).val());
									} else {
										node.deleteMetadata('media');
									}

									node.caption = self.i18n.active().oldCallflows.sip_code_caption + $('#response_code_input', popup_html).val();

									popup.dialog('close');
								} else {
									monster.ui.alert('error', self.i18n.active().oldCallflows.please_enter_a_valide_sip_code);
								}
							});

							popup = monster.ui.dialog(popup_html, {
								title: self.i18n.active().oldCallflows.response_title,
								minHeight: '0',
								beforeClose: function() {
									if(typeof callback == 'function') {
										callback();
									}
								}
							});
						});
					}
				},
				'missed_call_alert[]': {
					name: self.i18n.active().callflows.missedCallAlert.title,
					icon: 'bell',
					category: self.i18n.active().oldCallflows.advanced_cat,
					module: 'missed_call_alert',
					tip: self.i18n.active().callflows.missedCallAlert.tip,
					data: {
						name: ''
					},
					rules: [
						{
							type: 'quantity',
							maxSize: '1'
						}
					],
					isUsable: 'true',
					weight: 31,
					caption: function() {
						return '';
					},
					edit: function(node, callback) {
						self.miscEditMissedCallAlerts(node, callback);
					}
				}
			});
		},

		miscEditMissedCallAlerts: function(node, callback) {
			var self = this,
				recipients = node.getMetadata('recipients'),
				mapUsers = {},
				selectedEmails = [],
				popup;

			_.each(recipients, function(recipient) {
				if (recipient.type === 'user') {
					mapUsers[recipient.id] = recipient;
				} else if (recipient.type === 'email') {
					selectedEmails.push(recipient.id);
				}
			});

			self.miscUserList(function(users) {
				var items = [],
					selectedItems = [];

				_.each(users, function(user) {
					var formattedUser = {
						key: user.id,
						value: user.first_name + ' ' + user.last_name
					};

					items.push(formattedUser);

					if (mapUsers.hasOwnProperty(user.id)) {
						selectedItems.push(formattedUser);
					}
				});

				var template = $(monster.template(self, 'misc-missedCallAlert-dialog', { emails: selectedEmails.toString() })),
					widget = monster.ui.linkedColumns(template.find('.items-selector-wrapper'), items, selectedItems, {
						i18n: {
							columnsTitles: {
								available: self.i18n.active().callflows.missedCallAlert.unselectedUsers,
								selected: self.i18n.active().callflows.missedCallAlert.selectedUsers
							}
						},
						containerClasses: 'skinny'
					});

				template.find('#save_missed_call_alerts').on('click', function() {
					var recipients = [],
						emails = template.find('#emails').val();

					emails = emails.replace(/\s/g, '').split(',');

					_.each(emails, function(email) {
						recipients.push({
							type: 'email',
							id: email
						});
					});

					_.each(widget.getSelectedItems(), function(id) {
						recipients.push({
							type: 'user',
							id: id
						});
					});

					node.setMetadata('recipients', recipients);

					popup.dialog('close');
				});

				popup = monster.ui.dialog(template, {
					title: self.i18n.active().callflows.missedCallAlert.popupTitle,
					beforeClose: function() {
						if (typeof callback === 'function') {
							callback();
						}
					}
				});
			});
		},

		miscDeviceList: function(callback) {
			var self = this;

			self.callApi({
				resource: 'device.list',
				data: {
					accountId: self.accountId,
					filters: { paginate:false }
				},
				success: function(data, status) {
					callback && callback(data.data);
				}
			});
		},

		miscGroupList: function(callback) {
			var self = this;

			self.callApi({
				resource: 'group.list',
				data: {
					accountId: self.accountId,
					filters: { paginate:false }
				},
				success: function(data, status) {
					callback && callback(data.data);
				}
			});
		},

		miscUserList: function(callback) {
			var self = this;

			self.callApi({
				resource: 'user.list',
				data: {
					accountId: self.accountId,
					filters: { paginate:false }
				},
				success: function(data, status) {
					callback && callback(data.data);
				}
			});
		},

		miscMediaList: function(callback) {
			var self = this;

			self.callApi({
				resource: 'media.list',
				data: {
					accountId: self.accountId,
					filters: { paginate:false }
				},
				success: function(data, status) {
					callback && callback(data.data);
				}
			});
		}
	};

	return app;
});
