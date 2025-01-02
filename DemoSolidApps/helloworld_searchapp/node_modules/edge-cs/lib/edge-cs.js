var path = require('path');

exports.getCompiler = function () {
	return process.env.EDGE_CS_NATIVE || ( process.env.EDGE_USE_CORECLR ? path.join(__dirname, 'edge-cs-coreclr.dll') : path.join(__dirname, 'edge-cs.dll'));
};

exports.getBootstrapDependencyManifest = function() {
	return path.join(__dirname, 'edge-cs-coreclr.deps.json');
}
