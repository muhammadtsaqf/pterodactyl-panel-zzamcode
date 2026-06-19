import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers, useField } from 'formik';
import { object, string } from 'yup';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface Values {
    username: string;
    password: string;
}

const CustomField = ({ icon, label, ...props }: any) => {
    const [field, meta] = useField(props);
    return (
        <div css={tw`flex flex-col`}>
            <label css={tw`text-xs font-bold text-neutral-400 tracking-wider uppercase mb-2`}>{label}</label>
            <div css={tw`relative flex items-center`}>
                <div css={tw`absolute left-4 text-neutral-500`}>
                    <FontAwesomeIcon icon={icon} />
                </div>
                <input 
                    {...field} 
                    {...props} 
                    css={[
                        tw`w-full border rounded-xl text-sm text-white py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500`,
                        meta.touched && meta.error ? tw`border-red-500` : tw`border-neutral-700/50`,
                    ]} 
                    style={{ background: 'rgba(30, 41, 59, 0.4)' }}
                />
            </div>
            {meta.touched && meta.error ? (
                <div css={tw`text-red-500 text-xs mt-1`}>{meta.error}</div>
            ) : null}
        </div>
    );
};

const CustomPasswordField = ({ icon, label, ...props }: any) => {
    const [field, meta] = useField(props);
    const [show, setShow] = useState(false);
    return (
        <div css={tw`flex flex-col`}>
            <label css={tw`text-xs font-bold text-neutral-400 tracking-wider uppercase mb-2`}>{label}</label>
            <div css={tw`relative flex items-center`}>
                <div css={tw`absolute left-4 text-neutral-500`}>
                    <FontAwesomeIcon icon={icon} />
                </div>
                <input 
                    {...field} 
                    {...props} 
                    type={show ? 'text' : 'password'}
                    css={[
                        tw`w-full border rounded-xl text-sm text-white py-3 pl-10 pr-10 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500`,
                        meta.touched && meta.error ? tw`border-red-500` : tw`border-neutral-700/50`,
                    ]} 
                    style={{ background: 'rgba(30, 41, 59, 0.4)' }}
                />
                <button 
                    type="button" 
                    onClick={() => setShow(!show)}
                    css={tw`absolute right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer outline-none`}
                >
                    <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
                </button>
            </div>
            {meta.touched && meta.error ? (
                <div css={tw`text-red-500 text-xs mt-1`}>{meta.error}</div>
            ) : null}
        </div>
    );
};

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
                console.error(error);

                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('A username or email must be provided.'),
                password: string().required('Please enter your account password.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={'Authorize Account'} subtitle={'Masuk menggunakan akun panel Anda.'}>
                    <CustomField 
                        icon={faUser} 
                        label={'Account Access'} 
                        name={'username'} 
                        placeholder={'Username or email address'}
                        disabled={isSubmitting} 
                    />
                    
                    <div css={tw`relative`}>
                        <CustomPasswordField 
                            icon={faLock} 
                            label={'Security Key'} 
                            name={'password'} 
                            placeholder={'Enter your password'}
                            disabled={isSubmitting} 
                        />
                        <div css={tw`text-right mt-2`}>
                            <Link
                                to={'/auth/password'}
                                css={tw`text-xs text-neutral-400 tracking-wide no-underline hover:text-white transition-colors duration-200`}
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <div css={tw`mt-2`}>
                        <Button 
                            type={'submit'} 
                            size={'xlarge'} 
                            isLoading={isSubmitting} 
                            disabled={isSubmitting}
                            css={tw`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 border-none shadow-lg text-white font-semibold rounded-xl py-3 transition-all duration-300`}
                        >
                            Authorize Account <FontAwesomeIcon icon={faArrowRight} />
                        </Button>
                    </div>

                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}

                    {useStoreState((state: any) => state.settings.data!.registration) && (
                        <div css={tw`mt-4 text-center border-t border-white/5 pt-6`}>
                            <Link
                                to={'/auth/register'}
                                css={tw`text-xs text-neutral-400 tracking-wide no-underline hover:text-white transition-colors duration-200 font-medium`}
                            >
                                Belum punya akun? Create Account
                            </Link>
                        </div>
                    )}
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
