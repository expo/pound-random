import React, { Component } from 'react';
import styled from 'styled-components';
import {
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { Constants } from 'expo';
import { Feather } from '@expo/vector-icons';
import colors from '../../colors';
import Api from '../../Api';
import { Mutation } from 'react-apollo';
import { client } from '../../App';
import gql from 'graphql-tag';
import ButtonText from './ButtonText';
import CloseButton from './CloseButton';
import Container from './Container';
import Input from './Input';
import InputContainer from './InputContainer';
import Modal from './Modal';
import PlaceholderLogo from './PlaceholderLogo';
import Title from './Title';
import ConfirmationInputContainer from './ConfirmationInputContainer';
import assets from '../../assets';

const SignupMutation = gql`
  mutation signup($username: String!, $mobileNumber: String!) {
    signup(username: $username, mobileNumber: $mobileNumber) {
      userId
      normalizedMobileNumber
      normalizedUsername
    }
  }
`;

const LoginMutation = gql`
  mutation login($mobileNumber: String) {
    login(mobileNumber: $mobileNumber)
  }
`;

const CreateSession = gql`
  mutation createSession($mobileNumber: String, $loginCode: String) {
    createSession(mobileNumber: $mobileNumber, loginCode: $loginCode) {
      token
      userId
    }
  }
`;

const UsernameQuery = gql`
  query($username: String) {
    doesUsernameExist(username: $username)
  }
`;

class AuthForm extends Component {
  state = {
    showVerificationStep: false,
    code: null,
    error: null,
    loading: false,
    username: '',
    mobileNumber: '',
    errorCode: null,
  };

  _submitMobileNumberAsync = (login, signup) => async () => {
    this.setState({ loading: true });
    (await client.query({
      query: UsernameQuery,
      variables: { username: this.state.username.trim() },
    })).data.doesUsernameExist;
    try {
      if (
        !(await client.query({
          query: UsernameQuery,
          variables: { username: this.state.username.trim() },
        })).data.doesUsernameExist
      ) {
        var x = await signup({
          variables: {
            username: this.state.username.trim(),
            mobileNumber: this.state.mobileNumber.trim(),
          },
        });
      }
      await login({ variables: { mobileNumber: this.state.mobileNumber.trim() } });
      // Clear the error state
      this.setState({ errorCode: null, error: null, showVerificationStep: true, loading: false });
    } catch (e) {
      alert(e);
      this.setState({ errorCode: e.code, error: e.message, loading: false });
    }
  };

  _resendCodeAsync = (login) => async () => {
    this.setState({ loading: true });
    try {
      await login({ variables: { mobileNumber: this.state.mobileNumber.trim() } });
    } catch (e) {
      alert(e);
      this.setState({ errorCode: e.code, error: e.message });
    }

    this.setState({ loading: false });
  };

  _submitVerificationCodeAsync = (createSession) => async () => {
    let session;

    this.setState({ loading: true });
    try {
      session = (await createSession({
        variables: {
          mobileNumber: this.state.mobileNumber,
          loginCode: this.state.code,
        },
      })).data.createSession;
    } catch (e) {
      alert(e);
      this.setState({ errorCode: e.code, error: e.message });
    }

    this.setState({ loading: false });
    await Api.setSessionAsync(session);
    this.props.navigation.replace('Home', null, null, Math.random().toString());
  };

  renderCredentialsForm = (login, signup) => {
    return (
      <React.Fragment>
        <PlaceholderLogo source={assets.icons.icon} resizeMode="contain" />
        <Title>Sign up / Log in</Title>
        <Input
          placeholder="username"
          autoCapitalize="none"
          placeholderTextColor="rgba(255,255,255,0.5)"
          underlineColorAndroid="transparent"
          onChangeText={(text) => {
            this.setState({ username: text });
          }}
        />
        <Input
          placeholder="phone number"
          keyboardType="phone-pad"
          placeholderTextColor="rgba(255,255,255,0.5)"
          underlineColorAndroid="transparent"
          onChangeText={(text) => {
            this.setState({ mobileNumber: text });
          }}
          onSubmitEditing={this._submitMobileNumberAsync(login, signup)}
        />
        <TouchableOpacity onPress={this._submitMobileNumberAsync(login, signup)}>
          {this.state.loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <ButtonText>Send verification code</ButtonText>
          )}
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  renderVerification = (login, createSession) => {
    return (
      <React.Fragment>
        <Title>Verify your number</Title>
        <InputContainer>
          <Input
            placeholder="123456"
            underlineColorAndroid="transparent"
            keyboardType="number-pad"
            placeholderTextColor="rgba(255,255,255,0.5)"
            onChangeText={(text) => {
              this.setState({ code: text });
            }}
            onSubmitEditing={this._submitVerificationCodeAsync(createSession)}
          />
          <ConfirmationInputContainer onPress={this._submitVerificationCodeAsync(createSession)}>
            {this.state.loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Feather name="check" color="white" size={24} />
            )}
          </ConfirmationInputContainer>
        </InputContainer>
        <TouchableOpacity onPress={this._resendCodeAsync(login)}>
          {this.state.loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <ButtonText>Resend verification code to ({this.state.mobileNumber})</ButtonText>
          )}
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  render() {
    const login = async (o) => {
      return await client.mutate({
        mutation: LoginMutation,
        variables: o.variables,
      });
    };

    const signup = async (o) => {
      return await client.mutate({
        mutation: SignupMutation,
        variables: o.variables,
      });
    };

    const createSession = async (o) => {
      return await client.mutate({
        mutation: CreateSession,
        variables: o.variables,
      });
    };

    const V = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

    return (
      <Modal visible={this.props.visible}>
        <V
          behavior="padding"
          keyboardVerticalOffset={Constants.statusBarHeight}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Container>
            {this.state.showVerificationStep
              ? this.renderVerification(login, createSession)
              : this.renderCredentialsForm(login, signup)}
          </Container>
        </V>
        <CloseButton
          onPress={() => {
            this.setState({ showVerificationStep: false });
            this.props.onRequestClose();
          }}>
          <Feather name="x" color="white" size={32} />
        </CloseButton>
      </Modal>
    );
  }
}

export default AuthForm;
