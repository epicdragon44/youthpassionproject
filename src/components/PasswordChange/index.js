import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
  submitted: false,
};

class PasswordChangeForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { passwordOne } = this.state;

    this.setState({
      submitted: true,
    });

    this.props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { passwordOne, passwordTwo, error, submitted } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo || passwordOne === '';

      var errorMsg = null;

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="New Password"
        /> <br /> <br />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm New Password"
        /> <br /> <br />
        <button id="passwordbutton" onClick={() => this.setState({submitted: true})} disabled={isInvalid} type="submit">
          Reset My Password
        </button>
        <br /><br /><br /><br /><br />
        {/* {error && <p>{'Your passwords didn\'t match!'}</p>} */}
        {/* {(isInvalid) ? <p>{"Your passwords didn't match!"}</p> : null} */}
      </form>
    );
  }
}

export default withFirebase(PasswordChangeForm);