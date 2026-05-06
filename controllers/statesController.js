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
	deleteFunFact
};