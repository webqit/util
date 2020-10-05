
/**
 * @imports
 */
import Path from 'path';
import _arrFrom from '../arr/from.js';
import _isArray from '../js/isArray.js';
import _isNumeric from '../js/isNumeric.js';
import _isFunction from '../js/isFunction.js';
import Prompts from 'prompts';

/**
 * Extends prompts()
 */
const promptsSubmitExtension = async function(prompt, ans, answers) {

    if (prompt.prompts && prompt.prompts.questions && (prompt.type === 'confirm' || prompt.type === 'toggle')) {

        var subQuestions = _arrFrom(prompt.prompts.questions, false);
        var indentation = (typeof prompt.prompts.indentation === 'number' ? prompt.prompts.indentation : 2) + (prompt._indentation || 0);
        if (indentation) {
            subQuestions.forEach(subQuestion => {
                subQuestion.message = (' '.repeat(indentation)) + subQuestion.message;
                subQuestion._indentation = indentation;
            });
        }

        if (prompt.prompts.multiple) {
            answers[prompt.name] = prompt.prompts.combomode ? {} : [];

            if (ans) {
                var initials = prompt.prompts.initial || {};
                var initialsKeys = Object.keys(initials);
                const runPromts = async index => {
                    var _subQuestions = subQuestions, success;
                    if (initialsKeys[index]) {
                        if (prompt.prompts.combomode) {
                            _subQuestions = withInitials(subQuestions, [initialsKeys[index], initials[initialsKeys[index]]]);
                        } else {
                            _subQuestions = withInitials(subQuestions, initials[initialsKeys[index]]);
                        }
                    }
                    var subAnswers = await Promptx(_subQuestions);
                    if (prompt.prompts.combomode) {
                        if (subAnswers.name) {
                            answers[prompt.name][subAnswers.name] = subAnswers.value;
                            success = true;
                        }
                    } else {
                        answers[prompt.name].push(subAnswers);
                        success = true;
                    }
                    let add = {
                        name: 'add', 
                        type: 'toggle', 
                        message: (' '.repeat(indentation)) + (typeof prompt.prompts.multiple === 'string' ? prompt.prompts.multiple : 'Add new?'), 
                        active: 'YES',
                        inactive: 'NO',
                        initial: initialsKeys[index + 1],
                        onRender(kleur) {
                            this.msg = kleur.green(this.msg);
                        },
                    }
                    if (success && (await Prompts(add)).add) {
                        await runPromts(index + 1);
                    }
                };
                await runPromts(0);
            }

         } else {

            var _subQuestions = subQuestions;
            if (prompt.prompts.initial) {
                _subQuestions = withInitials(subQuestions, prompt.prompts.initial);
            }
            answers[prompt.name] = ans ? await Promptx(_subQuestions) : {};

        }
    }

};

/**
 * Injects initials into questions.
 */
const withInitials = (questions, initials) => {
    return questions.map((question, i) => {
        var _question = {...question};
        var  key = _isArray(initials) ?  i : question.name;
        if (_question.prompts && _question.prompts.questions && (_question.type === 'confirm' || _question.type === 'toggle')) {
            if (!('initial' in _question.prompts) && (key in initials)) {
                _question.prompts.initial = initials[key];
            }
        }
        _question.initial = (...args) => key in initials ? initials[key] 
            : (_isFunction(_question.initial) ? _question.initial(...args) : _question.initial);
        return _question;
    });
};

/**
 * @default
 */
const Promptx = (questions, options = {}) => Prompts(questions, {onSubmit: promptsSubmitExtension, ...options});

/**
 * @expots
 */
export {
    Promptx as default,
    promptsSubmitExtension,
    Prompts,
};

export const initialGetIndex = (choices, value, valueProp = 'value') => _isNumeric(value) ? value : choices.reduce((i, choice, _i) => choice[valueProp] === value ? _i : i, 0);

/**
 * -----------------
 * Validates imputs
 * -----------------
 */
export function validateAs(types, msgSfx = ':') {
    return val => {
        var test = true, type;
        while(test === true && (type = types.shift())) {
            test = validateAs[type](val, msgSfx);
        }
        return test;
    };
};
// Input
validateAs.input = (val, msgSfx) => true;
// number
validateAs.number = (val, msgSfx) => _isNumeric(val) ? true : 'This must be a number' + msgSfx;
// important
validateAs.important = (val, msgSfx) => val ? true : 'This is important' + msgSfx;
// confirm
validateAs.confirm = (val, msgSfx) => [true, false].includes(val) ? true : 'This must be "true" or "false' + msgSfx;

/**
 * -----------------
 * Validates imputs
 * -----------------
 */
export function transformAs(types) {
    return val => {
        var transformed = val, type;
        while(transformed && (type = types.shift())) {
            transformed = transformAs[type](transformed);
        }
        return transformed;
    };
};
// path
transformAs.path = val => Path.resolve(val);
// multiple
transformAs.multiple = (val, delimiter = ',') => _isArray(val) ? val : val.split(delimiter);

