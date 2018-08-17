import { Dimensions, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import styled from 'styled-components';
import colors from '../../colors';

export default styled.TouchableOpacity`
  height: 48px;

  justify-content: center;
  align-items: center;
  width: 48px;
  border-radius: 32px;
  margin-bottom: 24px;
  background-color: rgba(255, 255, 255, 0.4);
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
`;
