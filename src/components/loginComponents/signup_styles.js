import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000000',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'SF-Pro-Display-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Regular',
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Medium',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 20,
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'SF-Pro-Display-Regular',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingLeft: 20,
    height: 56,
  },
  atSymbol: {
    color: '#888888',
    fontSize: 17,
    fontFamily: 'SF-Pro-Display-Regular',
    marginRight: 2,
  },
  usernameInput: {
    flex: 1,
    height: '100%',
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'SF-Pro-Display-Regular',
    paddingRight: 20,
  },
  otpInput: {
    fontFamily: 'SF-Pro-Display-Bold',
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    height: 72,
  },
  signupTypeContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  typeButtonText: {
    color: '#888888',
    fontFamily: 'SF-Pro-Display-Medium',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  typeButtonTextActive: {
    color: '#000000',
    fontFamily: 'SF-Pro-Display-Semibold',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 100,
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Medium',
    marginRight: 6,
  },
  dropdownArrow: {
    color: '#888888',
    fontSize: 10,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 0,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    marginBottom: 24,
    marginTop: 8,
    backgroundColor: '#FFFFFF', // Fixed background for animation
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 17,
    fontFamily: 'SF-Pro-Display-Semibold',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: '#888888',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Medium',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#111111',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'SF-Pro-Display-Bold',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'SF-Pro-Display-Medium',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Regular',
  },
  countryDialCode: {
    color: '#888888',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Medium',
  },
  inputSuccess: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  inputIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  successIcon: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorIcon: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: 'bold',
  },
  usernameStatus: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  
    passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    height: 56,
  },
  
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Remove default padding to center text properly
  },
  
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  eyeIcon: {
    fontSize: 20,
    color: '#666',
  },








});

export default styles;