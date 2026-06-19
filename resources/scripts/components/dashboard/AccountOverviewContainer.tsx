import * as React from 'react';
import ContentBox from '@/components/elements/ContentBox';
import UpdatePasswordForm from '@/components/dashboard/forms/UpdatePasswordForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';
import UpdateProfileDetailsForm from '@/components/dashboard/forms/UpdateProfileDetailsForm';
import ConfigureTwoFactorForm from '@/components/dashboard/forms/ConfigureTwoFactorForm';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import { breakpoint } from '@/theme';
import styled from 'styled-components/macro';
import MessageBox from '@/components/MessageBox';
import { useLocation } from 'react-router-dom';

const Container = styled.div`
    ${tw`flex flex-wrap`};

    & > div {
        ${tw`w-full`};

        ${breakpoint('sm')`
      width: calc(50% - 1rem);
    `}

        ${breakpoint('md')`
      ${tw`w-auto flex-1`};
    `}
    }
`;

const ProfileContainer = styled.div`
    ${tw`flex flex-col lg:flex-row gap-8 mb-10 mt-10`};
`;

const LeftColumn = styled.div`
    ${tw`w-full lg:w-8/12 flex flex-col gap-8`};
`;

const RightColumn = styled.div`
    ${tw`w-full lg:w-4/12 flex flex-col gap-8`};
`;

export default () => {
    const { state } = useLocation<undefined | { twoFactorRedirect?: boolean }>();

    return (
        <PageContentBlock title={'Account Overview'}>
            {state?.twoFactorRedirect && (
                <MessageBox title={'2-Factor Required'} type={'error'}>
                    Your account must have two-factor authentication enabled in order to continue.
                </MessageBox>
            )}

            <ProfileContainer>
                <LeftColumn>
                    <ContentBox title={'Update Profile Details'} showFlashes={'account:profile'}>
                        <UpdateProfileDetailsForm />
                    </ContentBox>
                    <ContentBox title={'Update Password'} showFlashes={'account:password'}>
                        <UpdatePasswordForm />
                    </ContentBox>
                </LeftColumn>
                
                <RightColumn>
                    <ContentBox title={'Update Email Address'} showFlashes={'account:email'}>
                        <UpdateEmailAddressForm />
                    </ContentBox>
                    <ContentBox title={'Two-Step Verification'}>
                        <ConfigureTwoFactorForm />
                    </ContentBox>
                </RightColumn>
            </ProfileContainer>
        </PageContentBlock>
    );
};
