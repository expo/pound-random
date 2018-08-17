import { Dimensions, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import styled from 'styled-components';
import colors from '../../colors';

export default styled.TextInput`
  color: white;
  background-color: ${colors.black50};
  border-radius: 32px;
  padding-horizontal: 24px;
  padding-vertical: 12px;
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-family: InterUI;
  margin-bottom: 16px;
`;
