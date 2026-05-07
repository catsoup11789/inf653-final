const State = require('../models/States');
const statesData = require('../models/statesData.json');

/**
 * Get all states, with optional filtering for contiguous or non-contiguous states
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getAllStates = async (req, res) => {
	try {
		const { contig } = req.query;
		let filteredStates = [...statesData];

		if (contig === 'true') {
			filteredStates = statesData.filter(state => state.code !== 'AK' && state.code !== 'HI');
		} else if (contig === 'false') {
			filteredStates = statesData.filter(state => state.code === 'AK' || state.code === 'HI');
		}

		const statesWithFunFacts = await Promise.all(
			filteredStates.map(async (state) => {
				const dbState = await State.findOne({ stateCode: state.code });
				return {
					...state,
					...(dbState ? { funfacts: dbState.funfacts || [] } : {})
				};
			})
		);

		res.json(statesWithFunFacts);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get state by code
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getState = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();

	try {
		const stateData = statesData.find(state => state.code === stateCode);
		if (!stateData) {
			return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
		}

		const dbState = await State.findOne({ stateCode });
		const stateWithFunFacts = {
			...stateData,
			...(dbState ? { funfacts: dbState.funfacts || [] } : {})
		};

		res.json(stateWithFunFacts);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get random fun fact
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getFunFact = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();

	try {
		const stateData = statesData.find(state => state.code === stateCode);
		if (!stateData) {
			return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
		}

		const dbState = await State.findOne({ stateCode });
		if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
			return res.json({ message: `No Fun Facts found for ${stateData.state}` });
		}

		const randomFact = dbState.funfacts[Math.floor(Math.random() * dbState.funfacts.length)];
		res.json({ funfact: randomFact });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get capital
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getCapital = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();

	const stateData = statesData.find(state => state.code === stateCode);
	if (!stateData) {
		return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
	}

	res.json({
		state: stateData.state,
		capital: stateData.capital_city
	});
};

/**
 * Get nickname
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getNickname = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();

	const stateData = statesData.find(state => state.code === stateCode);
	if (!stateData) {
		return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
	}

	res.json({
		state: stateData.state,
		nickname: stateData.nickname
	});
};

/**
 * Get population
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getPopulation = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();

	const stateData = statesData.find(state => state.code === stateCode);
	if (!stateData) {
		return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
	}

	res.json({
		state: stateData.state,
		population: stateData.population.toLocaleString('en-US')
	});
};

/**
 * Get admission date
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getAdmission = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();

	const stateData = statesData.find(state => state.code === stateCode);
	if (!stateData) {
		return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
	}

	res.json({
		state: stateData.state,
		admitted: stateData.admission_date
	});
};

/**
 * Add fun facts to state
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const addFunFact = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();
	const { funfacts } = req.body;

	if (!funfacts) {
		return res.status(400).json({ message: 'State fun facts value required' });
	}

	if(!Array.isArray(funfacts)) {
		return res.status(400).json({ message: 'State fun facts value must be an array' });
	}

	try {
		const stateData = statesData.find(state => state.code === stateCode);
		if (!stateData) {
			return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
		}

		let dbState = await State.findOne({ stateCode });
		if (!dbState) {
			dbState = new State({ stateCode, funfacts: [] });
		}

		dbState.funfacts.push(...funfacts);
		await dbState.save();

		res.json(dbState);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Update fun fact at specific index
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const updateFunFact = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();
	const { index, funfact } = req.body;

	if (!index) {
		return res.status(400).json({ message: 'State fun fact index value required' });
	}

	if (!funfact) {
		return res.status(400).json({ message: 'State fun fact value required' });
	}

	try {
		const stateData = statesData.find(state => state.code === stateCode);
		if (!stateData) {
			return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
		}

		const dbState = await State.findOne({ stateCode });
		if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
			return res.json({ message: `No Fun Facts found for ${stateData.state}` });
		}

		const arrayIndex = parseInt(index) - 1;
		if (arrayIndex < 0 || arrayIndex >= dbState.funfacts.length) {
			return res.json({ message: `No Fun Fact found at that index for ${stateData.state}` });
		}

		dbState.funfacts[arrayIndex] = funfact;
		await dbState.save();

		res.json(dbState);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Delete fun fact at specific index
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const deleteFunFact = async (req, res) => {
	const stateCode = req.params.state.toUpperCase();
	const { index } = req.body;

	if (!index) {
		return res.status(400).json({ message: 'State fun fact index value required' });
	}

	try {
		const stateData = statesData.find(state => state.code === stateCode);
		if (!stateData) {
			return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
		}

		const dbState = await State.findOne({ stateCode });
		if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
			return res.json({ message: `No Fun Facts found for ${stateData.state}` });
		}

		const arrayIndex = parseInt(index) - 1;
		if (arrayIndex < 0 || arrayIndex >= dbState.funfacts.length) {
			return res.json({ message: `No Fun Fact found at that index for ${stateData.state}` });
		}

		dbState.funfacts.splice(arrayIndex, 1);
		await dbState.save();

		res.json(dbState);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get all states ranked by population (ascending or descending)
 * Query: ?order=asc|desc (default: desc)
 * @param req
 * @param res
 * @returns {*}
 */
const getPopulationRanking = (req, res) => {
	const order = (req.query.order || 'desc').toLowerCase();
	if (order !== 'asc' && order !== 'desc') {
		return res.status(400).json({ message: 'order query parameter must be "asc" or "desc"' });
	}
	const sorted = [...statesData].sort((a, b) =>
		order === 'asc' ? a.population - b.population : b.population - a.population
	);
	res.json(sorted.map((s, i) => ({
		rank: i + 1,
		state: s.state,
		code: s.code,
		population: s.population.toLocaleString('en-US')
	})));
};

/**
 * Get all states ranked by admission order (ascending or descending)
 * Query: ?order=asc|desc (default: asc)
 * @param req
 * @param res
 * @returns {*}
 */
const getAdmissionRanking = (req, res) => {
	const order = (req.query.order || 'asc').toLowerCase();
	if (order !== 'asc' && order !== 'desc') {
		return res.status(400).json({ message: 'order query parameter must be "asc" or "desc"' });
	}
	const sorted = [...statesData].sort((a, b) =>
		order === 'asc' ? a.admission_number - b.admission_number : b.admission_number - a.admission_number
	);
	res.json(sorted.map(s => ({
		admission_number: s.admission_number,
		state: s.state,
		code: s.code,
		admission_date: s.admission_date
	})));
};

/**
 * Get states admitted before a given year (exclusive)
 * GET /states/admitted/before/:year
 * @param req
 * @param res
 * @returns {*}
 */
const getAdmittedBefore = (req, res) => {
	const year = parseInt(req.params.year);
	if (isNaN(year)) {
		return res.status(400).json({ message: 'Invalid year parameter' });
	}
	const results = statesData
		.filter(s => new Date(s.admission_date).getFullYear() < year)
		.sort((a, b) => new Date(a.admission_date) - new Date(b.admission_date));
	res.json({ year, count: results.length, states: results.map(s => ({ state: s.state, code: s.code, admission_date: s.admission_date })) });
};

/**
 * Get states admitted after a given year (exclusive)
 * GET /states/admitted/after/:year
 * @param req
 * @param res
 * @returns {*}
 */
const getAdmittedAfter = (req, res) => {
	const year = parseInt(req.params.year);
	if (isNaN(year)) {
		return res.status(400).json({ message: 'Invalid year parameter' });
	}
	const results = statesData
		.filter(s => new Date(s.admission_date).getFullYear() > year)
		.sort((a, b) => new Date(a.admission_date) - new Date(b.admission_date));
	res.json({ year, count: results.length, states: results.map(s => ({ state: s.state, code: s.code, admission_date: s.admission_date })) });
};

/**
 * Get states admitted in a specific year
 * GET /states/admitted/:year
 * @param req
 * @param res
 * @returns {*}
 */
const getAdmittedInYear = (req, res) => {
	const year = parseInt(req.params.year);
	if (isNaN(year)) {
		return res.status(400).json({ message: 'Invalid year parameter' });
	}
	const results = statesData
		.filter(s => new Date(s.admission_date).getFullYear() === year)
		.sort((a, b) => new Date(a.admission_date) - new Date(b.admission_date));
	if (results.length === 0) {
		return res.json({ year, count: 0, message: `No states were admitted in ${year}`, states: [] });
	}
	res.json({ year, count: results.length, states: results.map(s => ({ state: s.state, code: s.code, admission_date: s.admission_date })) });
};

/**
 * Search states by name (partial, case-insensitive)
 * GET /states/search?name=new
 * @param req
 * @param res
 * @returns {*}
 */
const searchStates = (req, res) => {
	const { name } = req.query;
	if (!name || name.trim() === '') {
		return res.status(400).json({ message: 'name query parameter is required' });
	}
	const term = name.trim().toLowerCase();
	const results = statesData.filter(s => s.state.toLowerCase().includes(term));
	if (results.length === 0) {
		return res.json({ count: 0, message: `No states found matching "${name}"`, states: [] });
	}
	res.json({ count: results.length, states: results.map(s => ({ state: s.state, code: s.code, nickname: s.nickname })) });
};

module.exports = {
	getAllStates,
	getState,
	getFunFact,
	getCapital,
	getNickname,
	getPopulation,
	getAdmission,
	addFunFact,
	updateFunFact,
	deleteFunFact,
	getPopulationRanking,
	getAdmissionRanking,
	getAdmittedBefore,
	getAdmittedAfter,
	getAdmittedInYear,
	searchStates
};