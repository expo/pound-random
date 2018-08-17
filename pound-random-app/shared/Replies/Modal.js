import styled from 'styled-components';
import { Animated as Modal } from 'react-native-root-modal';

export default styled(Modal)`
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.2);
`;
