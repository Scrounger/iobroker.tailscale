var secret;
var _settings;
var myNamespace;

// This will be called by the admin adapter when the settings page loads
async function load(settings, onChange) {
    // example: select elements with id=key and class=value and insert value
    if (!settings) return;

    myNamespace = `${adapter}.${instance}`;

    addVersionToAdapterTitle();

    socket.emit('getObject', 'system.config', function (err, obj) {
        secret = (obj.native ? obj.native.secret : '') || 'Zgfr56gFe87jJOM';
        loadAccountTable(settings, settings.accounts || [], onChange);
    });

    $('.value').each(function () {
		var $key = $(this);
		var id = $key.attr('id');
		if ($key.attr('type') === 'checkbox') {
			// do not call onChange direct, because onChange could expect some arguments
			$key.prop('checked', settings[id])
				.on('change', () => onChange())
				;
		} else {
			// do not call onChange direct, because onChange could expect some arguments
			$key.val(settings[id])
				.on('change', () => onChange())
				.on('keyup', () => onChange())
				;
		}
	});

    _settings = settings;

    // eventsHandler(settings, onChange);

    onChange(false);

    // reinitialize all the Materialize labels on the page if you are dynamically adding inputs:
    if (M) M.updateTextFields();
}

function loadAccountTable(settings, accounts, onChange) {
    if (accounts.length > 0) {
        for (const account of accounts) {
            account.password = decrypt(secret, account.password);
            account.api = decrypt(secret, account.api);
        }
    }

    values2table('accounts', accounts, onChange);

    onChange(false);
    // function Materialize.updateTextFields(); to reinitialize all the Materialize labels on the page if you are dynamically adding inputs.
    M.updateTextFields();
}

function save(callback) {
    var obj = {};

    obj.accounts = table2values('accounts').filter(o => (o.name !== ''));
	if (obj.accounts.length > 0) {
		for (const account of obj.accounts) {
			account.password = encrypt(secret, account.password);
            account.api = encrypt(secret, account.api);
		}
	}

    callback(obj);
}

async function addVersionToAdapterTitle() {
    let instanceObj = await getObjectAsync(`system.adapter.${myNamespace}`);

    if (instanceObj && instanceObj.common && instanceObj.common.installedVersion) {
        let title = $('#adapterTitle');
        title.html(`${title.html()} <font size="3"><i>${instanceObj.common.installedVersion}</i></font>`);
    }
}

async function getObjectAsync(id) {
    return new Promise((resolve, reject) => {
        socket.emit('getObject', id, function (err, res) {
            if (!err && res) {
                resolve(res);
            } else {
                resolve(null);
            }
        });
    });
}