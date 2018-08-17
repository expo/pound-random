import styled from 'styled-components';
import colors from '../../colors';
import { Constants } from 'expo';

export default styled.TouchableOpacity`
  position: absolute;
  top: ${24 + Constants.statusBarHeight}px;
  left: 24px;
`;
