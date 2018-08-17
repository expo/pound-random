import { Dimensions, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import styled from 'styled-components';
import colors from '../../colors';

export default styled.View`
  justify-content: center;
  padding: 24px;
  align-items: center;
  border-radius: 16px;
  background-color: white;
  width: ${Dimensions.get('window').width - 64}px;
`;
