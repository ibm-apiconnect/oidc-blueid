(function (window, document) {
	
	var layout = document.getElementById('layout'),
	menu = document.getElementById('menu'),
	menuLink = document.getElementById('menuLink'),
	req_body = document.getElementById('req_body'),
	req_content_type = document.getElementById('req_content_type'),
	req_method = document.getElementById('req_method'),
	btn_send_request = document.getElementById('btn_send_request'),
	client_type = document.getElementById('client_type'),
	client_secret = document.getElementById('client_secret');
	
	function toggleClass(element, className) {
		var classes = element.className.split(/\s+/),
		length = classes.length,
		i = 0;
		
		for (; i < length; i++) {
			if (classes[i] === className) {
				classes.splice(i, 1);
				break;
			}
		}
		// The className is not found
		if (length === classes.length) {
			classes.push(className);
		}
		
		element.className = classes.join(' ');
	}
	
	menuLink.onclick = function (e) {
		var active = 'active';
		
		e.preventDefault();
		toggleClass(layout, active);
		toggleClass(menu, active);
		toggleClass(menuLink, active);
	};
	
	if (req_body) {
		req_body.onchange = function (e) {
			if (req_body.value && req_content_type.value == 'application/json') {
				try {
					new_body = JSON.parse(req_body.value);
					req_body.value = JSON.stringify(new_body, null, 3);
					req_body.style.border = '';
					req_body.style.color = '';
					btn_send_request.disabled = false;
				}
				catch (err) {
					req_body.style.border = 'solid 1px red';
					req_body.style.color = 'red';
					btn_send_request.disabled = true;
				}
			} else {
				req_body.style.border = '';
				req_body.style.color = '';
				btn_send_request.disabled = false;
			}
		};
	}
	
	if (req_method) {
		req_method.onchange = function (e) {
			
			if (req_method.value == 'GET') {
				req_content_type.disabled = true;
				req_body.disabled = true;
			} else {
				req_content_type.disabled = false;
				req_body.disabled = false;
			}
		};
	}
	
	if (client_type) {
		client_type.onchange = function (e) {
			if (client_type.value == 'Confidential') {
				client_secret.hidden = false;
			} else {
				client_secret.hidden = true;
			}
		};
	}
}
(this, this.document));