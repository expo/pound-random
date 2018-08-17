import styled from 'styled-components';

export default styled.ImageBackground`
  ${({ imageIsPresent }) => (imageIsPresent ? 'height: 184px;' : '')} width: 100%;
  align-items: center;
  justify-content: center;
  align-self: center;
  border-radius: 12px;
`;
