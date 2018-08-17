import { Dimensions, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import styled from 'styled-components';
import colors from '../../colors';
import ModL from 'react-native-root-modal';

export default styled(ModL)`
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
`;
