import React, { Component } from 'react';
import styled from 'styled-components';
import colors from '../../colors';

const Container = styled.View`
  background-color: black;
  padding: 16px;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const PromptText = styled.Text`
  color: white;
  font-size: 18px;
  font-family: 'InterUI Medium';
  text-align: center;
`;

const ButtonTouchable = styled.TouchableOpacity`
  background-color: rgba(255, 255, 255, 0.1);
  width: 100%;
  align-items: center;
  margin-top: 16px;
  border-radius: 12px;
`;

const ButtonLabel = styled.Text`
  color: white;
  font-size: 18px;
  font-family: 'InterUI Medium';
  text-align: center;
  margin-vertical: 8px;
`;

class AuthPrompt extends Component {
  render() {
    return (
      <Container>
        <PromptText>Want to join the discussion?</PromptText>
        <ButtonTouchable onPress={this.props.onPress}>
          <ButtonLabel>Hop in! 👋</ButtonLabel>
        </ButtonTouchable>
      </Container>
    );
  }
}

export default AuthPrompt;
